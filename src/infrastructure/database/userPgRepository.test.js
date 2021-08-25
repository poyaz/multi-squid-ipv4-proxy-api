/**
 * Created by pooya on 8/23/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const UserModel = require('~src/core/model/userModel');
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

suite(`UserPgRepository`, () => {
  setup(() => {
    const { postgresDb, identifierGenerator, userRepository } = helper.fakeUserPgRepository();

    testObj.postgresDb = postgresDb;
    testObj.identifierGeneratorSystem = identifierGenerator;
    testObj.userRepository = userRepository;

    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.fillModelSpy = sinon.spy(testObj.userRepository, '_fillModel');
  });

  teardown(() => {
    testObj.fillModelSpy.restore();
  });

  suite(`Get all users`, () => {
    test(`Should error get all when execute query`, async () => {
      const filterInput = new UserModel();
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.userRepository.getAll(filterInput);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully get all and return empty array`, async () => {
      const filterInput = new UserModel();
      const fetchQuery = {
        get rowCount() {
          return 0;
        },
        get rows() {
          return [];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.userRepository.getAll(filterInput);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.fillModelSpy.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should successfully get all and return records`, async () => {
      const filterInput = new UserModel();
      const fetchQuery = {
        get rowCount() {
          return 2;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              username: 'user1',
              is_enable: true,
              insert_date: '2021-08-23 13:37:50',
            },
            {
              id: testObj.identifierGenerator.generateId(),
              username: 'user2',
              is_enable: true,
              insert_date: '2021-08-23 13:37:50',
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.userRepository.getAll(filterInput);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.fillModelSpy.should.have.callCount(2);
      expect(error).to.be.a('null');
      expect(result).to.be.length(2);
      expect(result[0]).to.be.instanceOf(UserModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        username: 'user1',
        password: '',
        isEnable: true,
      });
      expect(result[1]).to.be.instanceOf(UserModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        username: 'user2',
        password: '',
        isEnable: true,
      });
    });

    test(`Should successfully get all with filter (with username)`, async () => {
      const filterInput = new UserModel();
      filterInput.username = 'user1';
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              username: 'user1',
              is_enable: true,
              insert_date: '2021-08-23 13:37:50',
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.userRepository.getAll(filterInput);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([filterInput.username])),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.instanceOf(UserModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        username: 'user1',
        password: '',
        isEnable: true,
      });
    });

    test(`Should successfully get all with filter (with isEnable)`, async () => {
      const filterInput = new UserModel();
      filterInput.isEnable = false;
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              username: 'user1',
              is_enable: true,
              insert_date: '2021-08-23 13:37:50',
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.userRepository.getAll(filterInput);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([filterInput.isEnable])),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.instanceOf(UserModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        username: 'user1',
        password: '',
        isEnable: true,
      });
    });

    test(`Should successfully get all with filter (with username and isEnable)`, async () => {
      const filterInput = new UserModel();
      filterInput.username = 'user1';
      filterInput.isEnable = true;
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              username: 'user1',
              is_enable: true,
              insert_date: '2021-08-23 13:37:50',
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.userRepository.getAll(filterInput);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([filterInput.username, true])),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.instanceOf(UserModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        username: 'user1',
        password: '',
        isEnable: true,
      });
    });
  });

  suite(`Check user exist`, () => {
    test(`Should error check user exist in database`, async () => {
      const inputUsername = 'username';
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.userRepository.isUserExist(inputUsername);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully check user exist in database`, async () => {
      const inputUsername = 'username';
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.userRepository.isUserExist(inputUsername);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.startsWith([inputUsername])),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.a('boolean').and.have.equal(true);
    });

    test(`Should successfully check user exist in database (not exist record)`, async () => {
      const inputUsername = 'username';
      const fetchQuery = {
        get rowCount() {
          return 0;
        },
        get rows() {
          return [];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.userRepository.isUserExist(inputUsername);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.startsWith([inputUsername])),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.a('boolean').and.have.equal(false);
    });
  });

  suite(`Add new user`, () => {
    test(`Should error add new user in database`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'username';
      inputModel.password = 'password';
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.userRepository.add(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully add new user in database`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'username';
      inputModel.password = 'password';
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              username: 'username',
              is_enable: true,
              insert_date: '2021-08-23 13:37:50',
            },
          ];
        },
      };
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.userRepository.add(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array
            .startsWith([testObj.identifierGenerator.generateId(), inputModel.username, true])
            .and(sinon.match.has('length', 4)),
        ),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.instanceOf(UserModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        username: 'username',
        password: '',
        isEnable: true,
      });
    });
  });
});
