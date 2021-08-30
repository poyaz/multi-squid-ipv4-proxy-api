/**
 * Created by pooya on 8/30/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const IpAddressModel = require('~src/core/model/ipAddressModel');
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

suite(`ProxyServerRepository`, () => {
  setup(() => {
    const {
      postgresDb,
      identifierGenerator,
      proxyServerRepository,
    } = helper.fakeProxyServerPgRepository();

    testObj.postgresDb = postgresDb;
    testObj.identifierGeneratorSystem = identifierGenerator;
    testObj.proxyServerRepository = proxyServerRepository;

    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.fillModelSpy = sinon.spy(testObj.proxyServerRepository, '_fillModel');
  });

  teardown(() => {
    testObj.fillModelSpy.restore();
  });

  suite(`Get ip list by range`, () => {
    test(`Should error get ip list range when fetch from database`, async () => {
      const inputIpWithMask = '192.168.1.0/29';
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.proxyServerRepository.getByIpMask(inputIpWithMask);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully get ip list range return null`, async () => {
      const inputIpWithMask = '192.168.1.0/29';
      const fetchQuery = {
        get rowCount() {
          return 0;
        },
        get rows() {
          return [];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.proxyServerRepository.getByIpMask(inputIpWithMask);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([inputIpWithMask])),
      );
      testObj.fillModelSpy.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should successfully get ip list range`, async () => {
      const inputIpWithMask = '192.168.1.0/29';
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              interface: 'ens192',
              ip: '192.168.1.1',
              port: 8080,
              gateway: '192.168.1.3',
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.proxyServerRepository.getByIpMask(inputIpWithMask);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([inputIpWithMask])),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.an.instanceof(IpAddressModel);
      expect(result[0]).to.be.includes({
        id: testObj.identifierGenerator.generateId(),
        interface: 'ens192',
        ip: '192.168.1.1',
        port: 8080,
        gateway: '192.168.1.3',
      });
    });
  });

  suite(`Add ip list by range`, () => {
    setup(() => {
      const inputIpModel1 = new IpAddressModel();
      inputIpModel1.ip = '192.168.1.1';
      inputIpModel1.mask = 32;
      inputIpModel1.gateway = '192.168.1.6';
      inputIpModel1.interface = 'ens192';

      const inputIpModel2 = new IpAddressModel();
      inputIpModel2.ip = '192.168.1.2';
      inputIpModel2.mask = 32;
      inputIpModel2.gateway = '192.168.1.6';
      inputIpModel2.interface = 'ens192';

      const inputIpModel3 = new IpAddressModel();
      inputIpModel3.ip = '192.168.1.3';
      inputIpModel3.mask = 32;
      inputIpModel3.gateway = '192.168.1.6';
      inputIpModel3.interface = 'ens192';

      testObj.inputIpModel1 = inputIpModel1;
      testObj.inputIpModel2 = inputIpModel2;
      testObj.inputIpModel3 = inputIpModel3;
    });

    test(`Should error add ip range when fetch from database`, async () => {
      const inputModelList = [testObj.inputIpModel1, testObj.inputIpModel2, testObj.inputIpModel3];
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.proxyServerRepository.add(inputModelList);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully add ip range`, async () => {
      const inputModelList = [testObj.inputIpModel1, testObj.inputIpModel2, testObj.inputIpModel3];
      const fetchQuery = {
        get rowCount() {
          return 3;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              interface: 'ens192',
              ip: '192.168.1.1',
              port: 8080,
              gateway: '192.168.1.6',
            },
            {
              id: testObj.identifierGenerator.generateId(),
              interface: 'ens192',
              ip: '192.168.1.2',
              port: 8080,
              gateway: '192.168.1.6',
            },
            {
              id: testObj.identifierGenerator.generateId(),
              interface: 'ens192',
              ip: '192.168.1.3',
              port: 8080,
              gateway: '192.168.1.6',
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.proxyServerRepository.add(inputModelList);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.has('length', 2)),
      );
      testObj.fillModelSpy.should.have.callCount(3);
      expect(error).to.be.a('null');
      expect(result).to.be.length(3);
      expect(result[0]).to.be.an.instanceof(IpAddressModel);
      expect(result[0]).to.be.includes({
        id: testObj.identifierGenerator.generateId(),
        interface: 'ens192',
        ip: '192.168.1.1',
        port: 8080,
        gateway: '192.168.1.6',
      });
      expect(result[1]).to.be.an.instanceof(IpAddressModel);
      expect(result[1]).to.be.includes({
        id: testObj.identifierGenerator.generateId(),
        interface: 'ens192',
        ip: '192.168.1.2',
        port: 8080,
        gateway: '192.168.1.6',
      });
      expect(result[2]).to.be.an.instanceof(IpAddressModel);
      expect(result[2]).to.be.includes({
        id: testObj.identifierGenerator.generateId(),
        interface: 'ens192',
        ip: '192.168.1.3',
        port: 8080,
        gateway: '192.168.1.6',
      });
    });
  });

  suite(`Active ip range`, () => {
    test(`Should error active ip range when fetch from database`, async () => {
      const inputIpWithMask = '192.168.1.0/29';
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.proxyServerRepository.activeIpMask(inputIpWithMask);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully active ip range`, async () => {
      const inputIpWithMask = '192.168.1.0/29';
      testObj.postgresDb.query.resolves();

      const [error] = await testObj.proxyServerRepository.activeIpMask(inputIpWithMask);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([inputIpWithMask])),
      );
      expect(error).to.be.a('null');
    });
  });
});
