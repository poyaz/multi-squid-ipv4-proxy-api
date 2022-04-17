/**
 * Created by pooya on 4/17/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const ProductModel = require('~src/core/model/productModel');
const ModelIdNotExistException = require('~src/core/exception/modelIdNotExistException');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');
const DatabaseMinParamUpdateException = require('~src/core/exception/databaseMinParamUpdateException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

/**
 * @property eventually
 * @property rejectedWith
 */
const expect = chai.expect;
const testObj = {};

suite(`ProductPgRepository`, () => {
  setup(() => {
    const {
      postgresDb,
      dateTime,
      identifierGenerator,
      productRepository,
    } = helper.fakeProductPgRepository();

    testObj.dateTime = dateTime;
    testObj.postgresDb = postgresDb;
    testObj.identifierGeneratorSystem = identifierGenerator;
    testObj.productRepository = productRepository;

    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.fillModelSpy = sinon.spy(testObj.productRepository, '_fillModel');
  });

  teardown(() => {
    testObj.fillModelSpy.restore();
  });

  suite(`Get all products`, () => {
    test(`Should error get all when execute query`, async () => {
      const filterInput = new ProductModel();
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.productRepository.getAll(filterInput);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully get all and return empty array`, async () => {
      const filterInput = new ProductModel();
      const fetchQuery = {
        get rowCount() {
          return 0;
        },
        get rows() {
          return [];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.productRepository.getAll(filterInput);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.fillModelSpy.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should successfully get all and return records`, async () => {
      const filterInput = new ProductModel();
      const fetchQuery = {
        get rowCount() {
          return 2;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              count: 6,
              price: 3000,
              expire_day: 30,
              is_enable: true,
              insert_date: '2021-08-23 13:37:50',
              update_date: null,
              delete_date: null,
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);
      testObj.dateTime.gregorianDateWithTimezone.returns('date');

      const [error, result] = await testObj.productRepository.getAll(filterInput);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.instanceOf(ProductModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        count: 6,
        price: 3000,
        expireDay: 30,
        isEnable: true,
        insertDate: 'date',
      });
    });

    test(`Should successfully get all with filter (with isEnable)`, async () => {
      const filterInput = new ProductModel();
      filterInput.isEnable = false;
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              count: 6,
              price: 3000,
              expire_day: 30,
              is_enable: false,
              insert_date: '2021-08-23 13:37:50',
              update_date: null,
              delete_date: null,
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);
      testObj.dateTime.gregorianDateWithTimezone.returns('date');

      const [error, result] = await testObj.productRepository.getAll(filterInput);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([filterInput.isEnable])),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.instanceOf(ProductModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        count: 6,
        price: 3000,
        expireDay: 30,
        isEnable: false,
        insertDate: 'date',
      });
    });
  });
});
