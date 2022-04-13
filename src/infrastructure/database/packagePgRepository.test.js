/**
 * Created by pooya on 8/26/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const PackageModel = require('~src/core/model/packageModel');
const ModelIdNotExistException = require('~src/core/exception/modelIdNotExistException');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');
const DatabaseRollbackException = require('~src/core/exception/databaseRollbackException');
const DatabaseConnectionException = require('~src/core/exception/databaseConnectionException');
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

suite(`PackagePgRepository`, () => {
  setup(() => {
    const {
      postgresDb,
      postgresDbClient,
      identifierGenerator,
      packageRepository,
    } = helper.fakePackagePgRepository();

    testObj.postgresDb = postgresDb;
    testObj.postgresDbClient = postgresDbClient;
    testObj.identifierGeneratorSystem = identifierGenerator;
    testObj.packageRepository = packageRepository;

    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.fillModelSpy = sinon.spy(testObj.packageRepository, '_fillModel');
  });

  teardown(() => {
    testObj.fillModelSpy.restore();
  });

  suite(`Get by id`, () => {
    test(`Should error get by id when fetch from database`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.packageRepository.getById(inputId);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully get by id return null`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const fetchQuery = {
        get rowCount() {
          return 0;
        },
        get rows() {
          return [];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.packageRepository.getById(inputId);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([inputId])),
      );
      testObj.fillModelSpy.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.a('null');
    });

    test(`Should successfully get by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              user_id: testObj.identifierGenerator.generateId(),
              username: 'user1',
              password: 'pass1',
              count_ip: 1,
              proxy_type: 'isp',
              country_code: 'GB',
              ip_list: [{ ip: '192.168.1.3', port: 8080 }],
              status: PackageModel.STATUS_ENABLE,
              expire_date: new Date(),
              insert_date: new Date(),
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.packageRepository.getById(inputId);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([inputId])),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(PackageModel);
      expect(result).to.be.includes({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator.generateId(),
        username: 'user1',
        password: 'pass1',
        countIp: 1,
        type: 'isp',
        country: 'GB',
        status: PackageModel.STATUS_ENABLE,
      });
      expect(result.expireDate).to.be.an.instanceOf(Date);
      expect(result.insertDate).to.be.an.instanceOf(Date);
      expect(result.ipList).to.be.length(1);
    });
  });

  suite(`Get all package by username`, () => {
    test(`Should error fetch from database`, async () => {
      const inputUsername = 'user1';
      const inputFilterModel = new PackageModel();
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.packageRepository.getAllByUsername(
        inputUsername,
        inputFilterModel,
      );

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully fetch from database and return empty list`, async () => {
      const inputUsername = 'user1';
      const inputFilterModel = new PackageModel();
      const fetchQuery = {
        get rowCount() {
          return 0;
        },
        get rows() {
          return [];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.packageRepository.getAllByUsername(
        inputUsername,
        inputFilterModel,
      );

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([inputUsername])),
      );
      testObj.fillModelSpy.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should successfully fetch from database`, async () => {
      const inputUsername = 'user1';
      const inputFilterModel = new PackageModel();
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              user_id: testObj.identifierGenerator.generateId(),
              username: 'user1',
              password: 'pass1',
              count_ip: 1,
              proxy_type: 'isp',
              country_code: 'gb',
              ip_list: [{ ip: '192.168.1.3', port: 8080 }],
              status: PackageModel.STATUS_ENABLE,
              expire_date: new Date(),
              insert_date: new Date(),
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.packageRepository.getAllByUsername(
        inputUsername,
        inputFilterModel,
      );

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([inputUsername])),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.an.instanceof(PackageModel);
      expect(result[0]).to.be.includes({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator.generateId(),
        username: inputUsername,
        password: 'pass1',
        countIp: 1,
        type: 'isp',
        country: 'GB',
        status: PackageModel.STATUS_ENABLE,
      });
      expect(result[0].expireDate).to.be.an.instanceOf(Date);
      expect(result[0].insertDate).to.be.an.instanceOf(Date);
      expect(result[0].ipList).to.be.length(1);
    });

    test(`Should successfully fetch from database with filter (with type)`, async () => {
      const inputUsername = 'user1';
      const inputFilterModel = new PackageModel();
      inputFilterModel.type = 'isp';
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              user_id: testObj.identifierGenerator.generateId(),
              username: 'user1',
              password: 'pass1',
              count_ip: 1,
              proxy_type: 'isp',
              country_code: 'gb',
              ip_list: [{ ip: '192.168.1.3', port: 8080 }],
              status: PackageModel.STATUS_ENABLE,
              expire_date: new Date(),
              insert_date: new Date(),
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.packageRepository.getAllByUsername(
        inputUsername,
        inputFilterModel,
      );

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array.deepEquals([inputUsername, inputFilterModel.type]),
        ),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.an.instanceof(PackageModel);
      expect(result[0]).to.be.includes({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator.generateId(),
        username: inputUsername,
        password: 'pass1',
        countIp: 1,
        type: 'isp',
        country: 'GB',
        status: PackageModel.STATUS_ENABLE,
      });
      expect(result[0].expireDate).to.be.an.instanceOf(Date);
      expect(result[0].insertDate).to.be.an.instanceOf(Date);
      expect(result[0].ipList).to.be.length(1);
    });

    test(`Should successfully fetch from database with filter (with country)`, async () => {
      const inputUsername = 'user1';
      const inputFilterModel = new PackageModel();
      inputFilterModel.country = 'gb';
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              user_id: testObj.identifierGenerator.generateId(),
              username: 'user1',
              password: 'pass1',
              count_ip: 1,
              proxy_type: 'isp',
              country_code: 'gb',
              ip_list: [{ ip: '192.168.1.3', port: 8080 }],
              status: PackageModel.STATUS_ENABLE,
              expire_date: new Date(),
              insert_date: new Date(),
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.packageRepository.getAllByUsername(
        inputUsername,
        inputFilterModel,
      );

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array.deepEquals([inputUsername, inputFilterModel.country.toUpperCase()]),
        ),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.an.instanceof(PackageModel);
      expect(result[0]).to.be.includes({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator.generateId(),
        username: inputUsername,
        password: 'pass1',
        countIp: 1,
        type: 'isp',
        country: 'GB',
        status: PackageModel.STATUS_ENABLE,
      });
      expect(result[0].expireDate).to.be.an.instanceOf(Date);
      expect(result[0].insertDate).to.be.an.instanceOf(Date);
      expect(result[0].ipList).to.be.length(1);
    });

    test(`Should successfully fetch from database with filter (with status)`, async () => {
      const inputUsername = 'user1';
      const inputFilterModel = new PackageModel();
      inputFilterModel.status = PackageModel.STATUS_ENABLE;
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              user_id: testObj.identifierGenerator.generateId(),
              username: 'user1',
              password: 'pass1',
              count_ip: 1,
              proxy_type: 'isp',
              country_code: 'gb',
              ip_list: [{ ip: '192.168.1.3', port: 8080 }],
              status: PackageModel.STATUS_ENABLE,
              expire_date: new Date(),
              insert_date: new Date(),
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.packageRepository.getAllByUsername(
        inputUsername,
        inputFilterModel,
      );

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array.deepEquals([inputUsername, PackageModel.STATUS_ENABLE]),
        ),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.an.instanceof(PackageModel);
      expect(result[0]).to.be.includes({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator.generateId(),
        username: inputUsername,
        password: 'pass1',
        countIp: 1,
        type: 'isp',
        country: 'GB',
        status: PackageModel.STATUS_ENABLE,
      });
      expect(result[0].expireDate).to.be.an.instanceOf(Date);
      expect(result[0].insertDate).to.be.an.instanceOf(Date);
      expect(result[0].ipList).to.be.length(1);
    });
  });

  suite(`Get all expire package`, () => {
    test(`Should error fetch from database`, async () => {
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.packageRepository.getAllExpirePackage();

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully fetch from database and return empty list`, async () => {
      const fetchQuery = {
        get rowCount() {
          return 0;
        },
        get rows() {
          return [];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.packageRepository.getAllExpirePackage();

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match
            .has('length', 2)
            .and(sinon.match.array.startsWith([PackageModel.STATUS_EXPIRE])),
        ),
      );
      testObj.fillModelSpy.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should successfully fetch from database`, async () => {
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              user_id: testObj.identifierGenerator.generateId(),
              username: 'user1',
              count_ip: 1,
              proxy_type: 'isp',
              country_code: 'gb',
              ip_list: [{ ip: '192.168.1.3', port: 8080 }],
              status: PackageModel.STATUS_ENABLE,
              expire_date: new Date(),
              insert_date: new Date(),
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.packageRepository.getAllExpirePackage();

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match
            .has('length', 2)
            .and(sinon.match.array.startsWith([PackageModel.STATUS_EXPIRE])),
        ),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.an.instanceof(PackageModel);
      expect(result[0]).to.be.includes({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator.generateId(),
        username: 'user1',
        countIp: 1,
        type: 'isp',
        country: 'GB',
        status: PackageModel.STATUS_ENABLE,
      });
      expect(result[0].expireDate).to.be.an.instanceOf(Date);
      expect(result[0].insertDate).to.be.an.instanceOf(Date);
      expect(result[0].ipList).to.be.length(1);
    });
  });

  suite(`Add new package`, () => {
    setup(() => {
      const inputModel = new PackageModel();
      inputModel.userId = testObj.identifierGenerator.generateId();
      inputModel.username = 'user1';
      inputModel.countIp = 2;
      inputModel.type = 'isp';
      inputModel.country = 'gb';
      inputModel.status = PackageModel.STATUS_ENABLE;
      inputModel.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

      testObj.inputModel = inputModel;
    });

    test(`Should error add new package when create database client`, async () => {
      const inputModel = testObj.inputModel;
      const connectionError = new Error('Connection error');
      testObj.postgresDb.connect.throws(connectionError);

      const [error] = await testObj.packageRepository.add(inputModel);

      testObj.postgresDb.connect.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseConnectionException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', connectionError);
    });

    test(`Should error add new package when create start transaction`, async () => {
      const inputModel = testObj.inputModel;
      const queryError = new Error('Query error');
      testObj.postgresDbClient.query.onCall(0).throws(queryError);

      const [error] = await testObj.packageRepository.add(inputModel);

      testObj.postgresDb.connect.should.have.callCount(1);
      testObj.postgresDbClient.query.should.have.callCount(1);
      testObj.postgresDbClient.query.getCall(0).should.calledWith('BEGIN');
      testObj.postgresDbClient.release.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should error add new package when execute other query`, async () => {
      const inputModel = testObj.inputModel;
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );
      testObj.postgresDbClient.query.onCall(0).resolves();
      const queryError = new Error('Query error');
      testObj.postgresDbClient.query.onCall(1).throws(queryError);
      testObj.postgresDbClient.query.onCall(2).resolves();

      const [error] = await testObj.packageRepository.add(inputModel);

      testObj.postgresDb.connect.should.have.callCount(1);
      testObj.postgresDbClient.query.should.have.callCount(3);
      testObj.postgresDbClient.query.getCall(0).should.calledWith('BEGIN');
      testObj.postgresDbClient.query.getCall(2).should.calledWith('ROLLBACK');
      testObj.postgresDbClient.release.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should error add new package when execute other query and rollback`, async () => {
      const inputModel = testObj.inputModel;
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );
      testObj.postgresDbClient.query.onCall(0).resolves();
      const queryError = new Error('Query error');
      testObj.postgresDbClient.query.onCall(1).throws(queryError);
      const rollbackError = new Error('Rollback error');
      testObj.postgresDbClient.query.onCall(2).throws(rollbackError);

      const [error] = await testObj.packageRepository.add(inputModel);

      testObj.postgresDb.connect.should.have.callCount(1);
      testObj.postgresDbClient.query.should.have.callCount(3);
      testObj.postgresDbClient.query.getCall(0).should.calledWith('BEGIN');
      testObj.postgresDbClient.query.getCall(2).should.calledWith('ROLLBACK');
      testObj.postgresDbClient.release.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseRollbackException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
      expect(error).to.have.property('rollbackErrorInfo', rollbackError);
    });

    test(`Should successfully add new package`, async () => {
      const inputModel = testObj.inputModel;
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );
      testObj.postgresDbClient.query.onCall(0).resolves();
      const fetchPackageQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              user_id: testObj.identifierGenerator.generateId(),
              username: testObj.inputModel.username,
              status: PackageModel.STATUS_ENABLE,
              expire_date: testObj.inputModel.expireDate,
              insert_date: new Date(),
            },
          ];
        },
      };
      testObj.postgresDbClient.query.onCall(1).resolves(fetchPackageQuery);
      const fetchIpQuery = {
        get rowCount() {
          return 2;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              ip: '192.168.2.3',
              port: 8080,
            },
            {
              id: testObj.identifierGenerator.generateId(),
              ip: '192.168.2.4',
              port: 8080,
            },
          ];
        },
      };
      testObj.postgresDbClient.query.onCall(2).resolves(fetchIpQuery);
      testObj.postgresDbClient.query.onCall(3).resolves();

      const [error, result] = await testObj.packageRepository.add(inputModel);

      testObj.postgresDb.connect.should.have.callCount(1);
      testObj.postgresDbClient.query.should.have.callCount(4);
      testObj.postgresDbClient.query.getCall(0).should.calledWith('BEGIN');
      const sinonMatch1 = sinon.match.has(
        'values',
        sinon.match
          .has('length', 5)
          .and(
            sinon.match.array.startsWith([
              testObj.identifierGenerator.generateId(),
              inputModel.userId,
              inputModel.status,
            ]),
          ),
      );
      testObj.postgresDbClient.query.getCall(1).should.calledWith(sinonMatch1);
      const sinonMatch2 = sinon.match.has('values', sinon.match.has('length', 6));
      testObj.postgresDbClient.query.getCall(2).should.calledWith(sinonMatch2);
      testObj.postgresDbClient.query.getCall(3).should.calledWith('END');
      testObj.fillModelSpy.should.have.callCount(1);
      testObj.postgresDbClient.release.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceOf(PackageModel);
      expect(result).to.be.includes({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator.generateId(),
        username: testObj.inputModel.username,
        countIp: testObj.inputModel.countIp,
        type: 'isp',
        country: 'GB',
        status: PackageModel.STATUS_ENABLE,
      });
      expect(result.expireDate).to.be.an.instanceOf(Date);
      expect(result.insertDate).to.be.an.instanceOf(Date);
      expect(result.ipList).to.be.length(2);
    });
  });

  suite(`Update package`, () => {
    test(`Should error update package when model id not found`, async () => {
      const inputModel = new PackageModel();

      const [error] = await testObj.packageRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(0);
      expect(error).to.be.an.instanceof(ModelIdNotExistException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', true);
    });

    test(`Should error update package when model property not set`, async () => {
      const inputModel = new PackageModel();
      inputModel.id = testObj.identifierGenerator.generateId();

      const [error] = await testObj.packageRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(0);
      expect(error).to.be.an.instanceof(DatabaseMinParamUpdateException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', true);
    });

    test(`Should error update package when execute query`, async () => {
      const inputModel = new PackageModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.expireDate = new Date();
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.packageRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully update package`, async () => {
      const inputModel = new PackageModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.expireDate = new Date();
      inputModel.updateDate = new Date();
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.packageRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.equal(1);
    });
  });
});
