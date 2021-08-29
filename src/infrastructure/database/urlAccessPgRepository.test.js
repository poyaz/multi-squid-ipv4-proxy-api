/**
 * Created by pooya on 8/28/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const UrlAccessModel = require('~src/core/model/urlAccessModel');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

/**
 * @property eventually
 * @property rejectedWith
 */
const expect = chai.expect;
const testObj = {};

suite(`UrlAccessPgRepository`, () => {
  setup(() => {
    const {
      postgresDb,
      identifierGenerator,
      urlAccessPgRepository,
    } = helper.fakeUrlAccessPgRepository();

    testObj.postgresDb = postgresDb;
    testObj.identifierGeneratorSystem = identifierGenerator;
    testObj.urlAccessPgRepository = urlAccessPgRepository;

    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.fillModelSpy = sinon.spy(testObj.urlAccessPgRepository, '_fillModel');
  });

  teardown(() => {
    testObj.fillModelSpy.restore();
  });

  suite(`Add new url access`, () => {
    setup(() => {
      const inputModel = new UrlAccessModel();
      inputModel.username = 'user1';
      inputModel.urlList = [
        { url: 'google.com', isBlock: true },
        { url: 'www.google.com', isBlock: true },
      ];
      inputModel.startDate = new Date();
      inputModel.endDate = new Date(new Date().getTime() + 60000);

      testObj.inputModel = inputModel;
      testObj.dateRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/;
    });

    test(`Should error add new url access when execute query`, async () => {
      const inputModel = testObj.inputModel;
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.urlAccessPgRepository.add(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully add new url access when execute query`, async () => {
      const inputModel = testObj.inputModel;
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              user_id: testObj.identifierGenerator.generateId(),
              url_list: ['google.com', 'www.google.com'],
              is_block: true,
              start_date: '2021-08-23 13:37:50',
              end_date: '2021-08-24 13:37:50',
              insert_date: '2021-08-23 13:37:50',
            },
          ];
        },
      };
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.urlAccessPgRepository.add(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(UrlAccessModel);
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator.generateId(),
        username: 'user1',
      });
      expect(result.urlList).to.be.length(2);
      expect(result.urlList[0]).to.have.include({ url: 'google.com', isBlock: true });
      expect(result.urlList[1]).to.have.include({ url: 'www.google.com', isBlock: true });
      expect(result.startDate).to.have.match(testObj.dateRegex);
      expect(result.endDate).to.have.match(testObj.dateRegex);
      expect(result.insertDate).to.have.match(testObj.dateRegex);
    });
  });
});
