/**
 * Created by pooya on 2/13/22.
 */

/**
 * Created by pooya on 8/31/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const ServerModel = require('~src/core/model/serverModel');
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

suite(`ServerRepository`, () => {
  setup(() => {
    const { postgresDb, identifierGenerator, serverRepository } = helper.fakeServerPgRepository();

    testObj.postgresDb = postgresDb;
    testObj.identifierGeneratorSystem = identifierGenerator;
    testObj.serverRepository = serverRepository;

    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.fillModelSpy = sinon.spy(testObj.serverRepository, '_fillModel');
  });

  teardown(() => {
    testObj.fillModelSpy.restore();
  });

  suite(`Get by id`, () => {
    test(`Should error get by id when fetch from database`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.serverRepository.getById(inputId);

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

      const [error, result] = await testObj.serverRepository.getById(inputId);

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
              name: 'server-1',
              ip_range: ['192.168.1.1/32', '192.168.2.1/24'],
              host_ip_address: '10.10.10.1',
              host_api_port: 8080,
              is_enable: true,
              insert_date: '2021-08-31 11:29:50',
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.serverRepository.getById(inputId);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([inputId])),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(ServerModel);
      expect(result).to.be.includes({
        id: testObj.identifierGenerator.generateId(),
        name: 'server-1',
        hostIpAddress: '10.10.10.1',
        hostApiPort: 8080,
        isEnable: true,
      });
      expect(result.ipRange).to.be.deep.equal(['192.168.1.1/32', '192.168.2.1/24']);
    });
  });

  suite(`Get by ip address`, () => {
    test(`Should error get by ip address when fetch from database`, async () => {
      const inputIp = '192.168.1.3';
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.serverRepository.getByIpAddress(inputIp);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully get by ip address return null`, async () => {
      const inputIp = '192.168.1.3';
      const fetchQuery = {
        get rowCount() {
          return 0;
        },
        get rows() {
          return [];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.serverRepository.getByIpAddress(inputIp);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([inputIp])),
      );
      testObj.fillModelSpy.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.a('null');
    });

    test(`Should successfully get by ip address`, async () => {
      const inputIp = '192.168.1.3';
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              name: 'server-1',
              ip_range: ['192.168.1.1/32', '192.168.2.1/24'],
              host_ip_address: '10.10.10.1',
              host_api_port: 8080,
              is_enable: true,
              insert_date: '2021-08-31 11:29:50',
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.serverRepository.getByIpAddress(inputIp);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([inputIp])),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(ServerModel);
      expect(result).to.be.includes({
        id: testObj.identifierGenerator.generateId(),
        name: 'server-1',
        hostIpAddress: '10.10.10.1',
        hostApiPort: 8080,
        isEnable: true,
      });
      expect(result.ipRange).to.be.deep.equal(['192.168.1.1/32', '192.168.2.1/24']);
    });
  });

  suite(`Get all`, () => {
    test(`Should error get all when fetch from database`, async () => {
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.serverRepository.getAll();

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully get all return null`, async () => {
      const fetchQuery = {
        get rowCount() {
          return 0;
        },
        get rows() {
          return [];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.serverRepository.getAll();

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([])),
      );
      testObj.fillModelSpy.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.a('null');
    });

    test(`Should successfully get all`, async () => {
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              name: 'server-1',
              ip_range: ['192.168.1.1/32', '192.168.2.1/24'],
              host_ip_address: '10.10.10.1',
              host_api_port: 8080,
              is_enable: true,
              insert_date: '2021-08-31 11:29:50',
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.serverRepository.getAll();

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([])),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result.length).to.be.equal(1);
      expect(result[0]).to.be.an.instanceof(ServerModel);
      expect(result[0]).to.be.includes({
        id: testObj.identifierGenerator.generateId(),
        name: 'server-1',
        hostIpAddress: '10.10.10.1',
        hostApiPort: 8080,
        isEnable: true,
      });
      expect(result[0].ipRange).to.be.deep.equal(['192.168.1.1/32', '192.168.2.1/24']);
    });
  });

  suite(`Add new server`, () => {
    setup(() => {
      const inputModel = new ServerModel();
      inputModel.name = 'server-1';
      inputModel.ipRange = ['192.168.1.1/32', '192.168.2.1/24'];
      inputModel.hostIpAddress = '10.10.10.1';
      inputModel.hostApiPort = 8080;

      testObj.inputModel = inputModel;
    });

    test(`Should error add server user in database`, async () => {
      const inputModel = testObj.inputModel;
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.serverRepository.add(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully add new server in database`, async () => {
      const inputModel = testObj.inputModel;
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              name: 'server-1',
              ip_range: ['192.168.1.1/32', '192.168.2.1/24'],
              host_ip_address: '10.10.10.1',
              host_api_port: 8080,
              is_enable: true,
              insert_date: '2021-08-31 11:29:50',
            },
          ];
        },
      };
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.serverRepository.add(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array
            .startsWith([testObj.identifierGenerator.generateId(), inputModel.name])
            .and(sinon.match.has('length', 7)),
        ),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(ServerModel);
      expect(result).to.be.includes({
        id: testObj.identifierGenerator.generateId(),
        name: 'server-1',
        hostIpAddress: '10.10.10.1',
        hostApiPort: 8080,
        isEnable: true,
      });
      expect(result.ipRange).to.be.deep.equal(['192.168.1.1/32', '192.168.2.1/24']);
    });
  });

  suite(`Update server`, () => {
    test(`Should error update server when model id not found`, async () => {
      const inputModel = new ServerModel();

      const [error] = await testObj.serverRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(0);
      expect(error).to.be.an.instanceof(ModelIdNotExistException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', true);
    });

    test(`Should error update server when model property not set`, async () => {
      const inputModel = new ServerModel();
      inputModel.id = testObj.identifierGenerator.generateId();

      const [error] = await testObj.serverRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(0);
      expect(error).to.be.an.instanceof(DatabaseMinParamUpdateException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', true);
    });

    test(`Should error update server when execute query`, async () => {
      const inputModel = new ServerModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.isEnable = true;
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.serverRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully update server`, async () => {
      const inputModel = new ServerModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.isEnable = true;
      testObj.postgresDb.query.resolves();

      const [error] = await testObj.serverRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });

  suite(`Delete by id`, () => {
    test(`Should error get by id when fetch from database`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.serverRepository.delete(inputId);

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

      const [error] = await testObj.serverRepository.delete(inputId);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([inputId])),
      );
      testObj.fillModelSpy.should.have.callCount(0);
      expect(error).to.be.a('null');
    });

    test(`Should successfully get by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error] = await testObj.serverRepository.delete(inputId);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([inputId])),
      );
      expect(error).to.be.a('null');
    });
  });
});
