/**
 * Created by pooya on 2/20/22.
 */

/**
 * Created by pooya on 8/31/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const axios = require('axios');
const axiosGetStub = sinon.stub(axios, 'get');
const axiosPostStub = sinon.stub(axios, 'post');
const axiosPutStub = sinon.stub(axios, 'put');
const axiosDeleteStub = sinon.stub(axios, 'delete');

const helper = require('~src/helper');

const UserModel = require('~src/core/model/userModel');
const JobModel = require('~src/core/model/jobModel');
const ServerModel = require('~src/core/model/serverModel');
const PackageModel = require('~src/core/model/packageModel');
const IpAddressModel = require('~src/core/model/ipAddressModel');
const IpInterfaceModel = require('~src/core/model/ipInterfaceModel');
const UnknownException = require('~src/core/exception/unknownException');
const ApiCallException = require('~src/core/exception/apiCallException');
const NotFoundException = require('~src/core/exception/notFoundException');
const UnauthorizedException = require('~src/core/exception/unauthorizedException');
const ForbiddenException = require('~src/core/exception/forbiddenException');
const SchemaValidatorException = require('~src/core/exception/schemaValidatorException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

/**
 * @property eventually
 * @property rejectedWith
 */
const expect = chai.expect;
const testObj = {};

suite(`ProxyServerApiRepository`, () => {
  setup(() => {
    const { dateTime, proxyServerApiRepository } = helper.fakeProxyServerApiRepository();

    testObj.dateTime = dateTime;
    testObj.proxyServerApiRepository = proxyServerApiRepository;

    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
    testObj.consoleError = sinon.stub(console, 'error');
  });

  teardown(() => {
    axiosGetStub.resetHistory();
    axiosPostStub.resetHistory();
    axiosPutStub.resetHistory();
    axiosDeleteStub.resetHistory();
    testObj.consoleError.restore();
  });

  suite(`Generate ip`, () => {
    test(`Should error execute generate ip when unknown error happened`, async () => {
      const inputIpAddressModel = new IpAddressModel();
      inputIpAddressModel.ip = '192.168.1.0';
      inputIpAddressModel.mask = 24;
      inputIpAddressModel.gateway = '192.168.1.1';
      inputIpAddressModel.interface = 'ens192';
      inputIpAddressModel.type = 'isp';
      inputIpAddressModel.country = 'GB';
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const apiError = new Error('API call error');
      axiosPostStub.throws(apiError);

      const [error] = await testObj.proxyServerApiRepository.generateIp(
        inputIpAddressModel,
        inputServerModel,
      );

      axiosPostStub.should.have.callCount(1);
      axiosPostStub.should.have.calledWith(
        sinon.match.string,
        sinon.match
          .has('ip', inputIpAddressModel.ip)
          .and(sinon.match.has('mask', inputIpAddressModel.mask))
          .and(sinon.match.has('gateway', inputIpAddressModel.gateway))
          .and(sinon.match.has('interface', inputIpAddressModel.interface))
          .and(sinon.match.has('type', inputIpAddressModel.type))
          .and(sinon.match.has('country', inputIpAddressModel.country)),
      );
      expect(error).to.be.an.instanceof(ApiCallException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error execute generate ip when request error happened`, async () => {
      const inputIpAddressModel = new IpAddressModel();
      inputIpAddressModel.ip = '192.168.1.0';
      inputIpAddressModel.mask = 24;
      inputIpAddressModel.gateway = '192.168.1.1';
      inputIpAddressModel.interface = 'ens192';
      inputIpAddressModel.type = 'isp';
      inputIpAddressModel.country = 'GB';
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const apiError = new Error('API call error');
      apiError.request = 'Error';
      axiosPostStub.throws(apiError);

      const [error] = await testObj.proxyServerApiRepository.generateIp(
        inputIpAddressModel,
        inputServerModel,
      );

      axiosPostStub.should.have.callCount(1);
      axiosPostStub.should.have.calledWith(
        sinon.match.string,
        sinon.match
          .has('ip', inputIpAddressModel.ip)
          .and(sinon.match.has('mask', inputIpAddressModel.mask))
          .and(sinon.match.has('gateway', inputIpAddressModel.gateway))
          .and(sinon.match.has('interface', inputIpAddressModel.interface))
          .and(sinon.match.has('type', inputIpAddressModel.type))
          .and(sinon.match.has('country', inputIpAddressModel.country)),
      );
      expect(error).to.be.an.instanceof(ApiCallException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error execute generate ip when response error happened (401 Unauthorized)`, async () => {
      const inputIpAddressModel = new IpAddressModel();
      inputIpAddressModel.ip = '192.168.1.0';
      inputIpAddressModel.mask = 24;
      inputIpAddressModel.gateway = '192.168.1.1';
      inputIpAddressModel.interface = 'ens192';
      inputIpAddressModel.type = 'isp';
      inputIpAddressModel.country = 'GB';
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const apiError = new Error('API call error');
      apiError.response = {
        data: {
          code: 401,
          description: 'Unauthorized',
        },
        status: 401,
      };
      axiosPostStub.throws(apiError);

      const [error] = await testObj.proxyServerApiRepository.generateIp(
        inputIpAddressModel,
        inputServerModel,
      );

      axiosPostStub.should.have.callCount(1);
      axiosPostStub.should.have.calledWith(
        sinon.match.string,
        sinon.match
          .has('ip', inputIpAddressModel.ip)
          .and(sinon.match.has('mask', inputIpAddressModel.mask))
          .and(sinon.match.has('gateway', inputIpAddressModel.gateway))
          .and(sinon.match.has('interface', inputIpAddressModel.interface))
          .and(sinon.match.has('type', inputIpAddressModel.type))
          .and(sinon.match.has('country', inputIpAddressModel.country)),
      );
      expect(error).to.be.an.instanceof(UnauthorizedException);
      expect(error).to.have.property('httpCode', 401);
    });

    test(`Should error execute generate ip when response error happened (403 Forbidden)`, async () => {
      const inputIpAddressModel = new IpAddressModel();
      inputIpAddressModel.ip = '192.168.1.0';
      inputIpAddressModel.mask = 24;
      inputIpAddressModel.gateway = '192.168.1.1';
      inputIpAddressModel.interface = 'ens192';
      inputIpAddressModel.type = 'isp';
      inputIpAddressModel.country = 'GB';
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const apiError = new Error('API call error');
      apiError.response = {
        data: {
          code: 403,
          description: 'Forbidden',
        },
        status: 403,
      };
      axiosPostStub.throws(apiError);

      const [error] = await testObj.proxyServerApiRepository.generateIp(
        inputIpAddressModel,
        inputServerModel,
      );

      axiosPostStub.should.have.callCount(1);
      axiosPostStub.should.have.calledWith(
        sinon.match.string,
        sinon.match
          .has('ip', inputIpAddressModel.ip)
          .and(sinon.match.has('mask', inputIpAddressModel.mask))
          .and(sinon.match.has('gateway', inputIpAddressModel.gateway))
          .and(sinon.match.has('interface', inputIpAddressModel.interface))
          .and(sinon.match.has('type', inputIpAddressModel.type))
          .and(sinon.match.has('country', inputIpAddressModel.country)),
      );
      expect(error).to.be.an.instanceof(ForbiddenException);
      expect(error).to.have.property('httpCode', 403);
    });

    test(`Should error execute generate ip when response error happened (404 not found)`, async () => {
      const inputIpAddressModel = new IpAddressModel();
      inputIpAddressModel.ip = '192.168.1.0';
      inputIpAddressModel.mask = 24;
      inputIpAddressModel.gateway = '192.168.1.1';
      inputIpAddressModel.interface = 'ens192';
      inputIpAddressModel.type = 'isp';
      inputIpAddressModel.country = 'GB';
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const apiError = new Error('API call error');
      apiError.response = {
        data: {
          code: 404,
          description: 'Not Found',
        },
        status: 404,
      };
      axiosPostStub.throws(apiError);

      const [error] = await testObj.proxyServerApiRepository.generateIp(
        inputIpAddressModel,
        inputServerModel,
      );

      axiosPostStub.should.have.callCount(1);
      axiosPostStub.should.have.calledWith(
        sinon.match.string,
        sinon.match
          .has('ip', inputIpAddressModel.ip)
          .and(sinon.match.has('mask', inputIpAddressModel.mask))
          .and(sinon.match.has('gateway', inputIpAddressModel.gateway))
          .and(sinon.match.has('interface', inputIpAddressModel.interface))
          .and(sinon.match.has('type', inputIpAddressModel.type))
          .and(sinon.match.has('country', inputIpAddressModel.country)),
      );
      expect(error).to.be.an.instanceof(NotFoundException);
      expect(error).to.have.property('httpCode', 404);
    });

    test(`Should error execute generate ip when response error happened (400 schema validator)`, async () => {
      const inputIpAddressModel = new IpAddressModel();
      inputIpAddressModel.ip = '192.168.1.0';
      inputIpAddressModel.mask = 24;
      inputIpAddressModel.gateway = '192.168.1.1';
      inputIpAddressModel.interface = 'ens192';
      inputIpAddressModel.type = 'isp';
      inputIpAddressModel.country = 'GB';
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const apiError = new Error('API call error');
      apiError.response = {
        data: {
          name: 'SchemaValidatorError',
          error: 'The submitted data is not valid.',
          additionalInfo: [{ message: '"ip" is required' }],
        },
        status: 400,
      };
      axiosPostStub.throws(apiError);

      const [error] = await testObj.proxyServerApiRepository.generateIp(
        inputIpAddressModel,
        inputServerModel,
      );

      axiosPostStub.should.have.callCount(1);
      axiosPostStub.should.have.calledWith(
        sinon.match.string,
        sinon.match
          .has('ip', inputIpAddressModel.ip)
          .and(sinon.match.has('mask', inputIpAddressModel.mask))
          .and(sinon.match.has('gateway', inputIpAddressModel.gateway))
          .and(sinon.match.has('interface', inputIpAddressModel.interface))
          .and(sinon.match.has('type', inputIpAddressModel.type))
          .and(sinon.match.has('country', inputIpAddressModel.country)),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.an.instanceof(SchemaValidatorException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).have.nested.property('additionalInfo[0].message', `"ip" is required`);
    });

    test(`Should error execute generate ip when response error happened (have any error)`, async () => {
      const inputIpAddressModel = new IpAddressModel();
      inputIpAddressModel.ip = '192.168.1.0';
      inputIpAddressModel.mask = 24;
      inputIpAddressModel.gateway = '192.168.1.1';
      inputIpAddressModel.interface = 'ens192';
      inputIpAddressModel.type = 'isp';
      inputIpAddressModel.country = 'GB';
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const apiError = new Error('API call error');
      apiError.response = {
        data: {
          code: 400,
          name: 'UnknownError',
        },
        status: 400,
      };
      axiosPostStub.throws(apiError);

      const [error] = await testObj.proxyServerApiRepository.generateIp(
        inputIpAddressModel,
        inputServerModel,
      );

      axiosPostStub.should.have.callCount(1);
      axiosPostStub.should.have.calledWith(
        sinon.match.string,
        sinon.match
          .has('ip', inputIpAddressModel.ip)
          .and(sinon.match.has('mask', inputIpAddressModel.mask))
          .and(sinon.match.has('gateway', inputIpAddressModel.gateway))
          .and(sinon.match.has('interface', inputIpAddressModel.interface))
          .and(sinon.match.has('type', inputIpAddressModel.type))
          .and(sinon.match.has('country', inputIpAddressModel.country)),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully execute generate ip `, async () => {
      const inputIpAddressModel = new IpAddressModel();
      inputIpAddressModel.ip = '192.168.1.0';
      inputIpAddressModel.mask = 24;
      inputIpAddressModel.gateway = '192.168.1.1';
      inputIpAddressModel.interface = 'ens192';
      inputIpAddressModel.type = 'isp';
      inputIpAddressModel.country = 'GB';
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const outputObj = {
        status: 'success',
        data: {
          jobId: testObj.identifierGenerator.generateId(),
        },
      };
      axiosPostStub.resolves({ data: outputObj });

      const [error, result] = await testObj.proxyServerApiRepository.generateIp(
        inputIpAddressModel,
        inputServerModel,
      );

      axiosPostStub.should.have.callCount(1);
      axiosPostStub.should.have.calledWith(
        sinon.match.string,
        sinon.match
          .has('ip', inputIpAddressModel.ip)
          .and(sinon.match.has('mask', inputIpAddressModel.mask))
          .and(sinon.match.has('gateway', inputIpAddressModel.gateway))
          .and(sinon.match.has('interface', inputIpAddressModel.interface))
          .and(sinon.match.has('type', inputIpAddressModel.type))
          .and(sinon.match.has('country', inputIpAddressModel.country)),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(JobModel);
      expect(result.id).to.be.equal(testObj.identifierGenerator.generateId());
    });
  });

  suite(`Delete ip address`, () => {
    test(`Should error delete ip address`, async () => {
      const inputIpAddressModel = new IpAddressModel();
      inputIpAddressModel.ip = '192.168.1.0';
      inputIpAddressModel.mask = 24;
      inputIpAddressModel.interface = 'ens192';
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const apiError = new Error('API call error');
      axiosDeleteStub.throws(apiError);

      const [error] = await testObj.proxyServerApiRepository.deleteIp(
        inputIpAddressModel,
        inputServerModel,
      );

      axiosDeleteStub.should.have.callCount(1);
      axiosDeleteStub.should.have.calledWith(
        sinon.match.string,
        sinon.match
          .hasNested('data.ip', inputIpAddressModel.ip)
          .and(sinon.match.hasNested('data.mask', inputIpAddressModel.mask))
          .and(sinon.match.hasNested('data.interface', inputIpAddressModel.interface)),
      );
      expect(error).to.be.an.instanceof(ApiCallException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully delete ip address`, async () => {
      const inputIpAddressModel = new IpAddressModel();
      inputIpAddressModel.ip = '192.168.1.0';
      inputIpAddressModel.mask = 24;
      inputIpAddressModel.interface = 'ens192';
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const outputObj = {
        status: 'success',
        data: {
          jobId: testObj.identifierGenerator.generateId(),
        },
      };
      axiosDeleteStub.resolves({ data: outputObj });

      const [error, result] = await testObj.proxyServerApiRepository.deleteIp(
        inputIpAddressModel,
        inputServerModel,
      );

      axiosDeleteStub.should.have.callCount(1);
      axiosDeleteStub.should.have.calledWith(
        sinon.match.string,
        sinon.match
          .hasNested('data.ip', inputIpAddressModel.ip)
          .and(sinon.match.hasNested('data.mask', inputIpAddressModel.mask))
          .and(sinon.match.hasNested('data.interface', inputIpAddressModel.interface)),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(JobModel);
      expect(result.id).to.be.equal(testObj.identifierGenerator.generateId());
    });
  });

  suite(`Get all package by username for each instance`, () => {
    test(`Should error get all package by username for each instance`, async () => {
      const inputUsername = 'user1';
      const filterModel = new PackageModel();
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const apiError = new Error('API call error');
      axiosGetStub.throws(apiError);

      const [error] = await testObj.proxyServerApiRepository.getAllPackageByUsername(
        inputUsername,
        filterModel,
        inputServerModel,
      );

      axiosGetStub.should.have.callCount(1);
      axiosGetStub.should.have.calledWith(sinon.match.string);
      expect(error).to.be.an.instanceof(ApiCallException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully get all package by username for each instance`, async () => {
      const inputUsername = 'user1';
      const filterModel = new PackageModel();
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const outputObj = {
        status: 'success',
        data: [
          {
            id: testObj.identifierGenerator.generateId(),
            username: 'my_username',
            password: 'my_password',
            countIp: 25,
            type: 'isp',
            country: 'GB',
            expireDate: '2021-10-25',
            ipList: [],
            isEnable: true,
          },
          {
            id: testObj.identifierGenerator.generateId(),
            username: 'my_username',
            password: 'my_password',
            countIp: 10,
            type: 'isp',
            country: 'GB',
            expireDate: '2021-08-25',
            ipList: [],
            isEnable: true,
          },
        ],
      };
      axiosGetStub.resolves({ data: outputObj });

      const [error, result] = await testObj.proxyServerApiRepository.getAllPackageByUsername(
        inputUsername,
        filterModel,
        inputServerModel,
      );

      axiosGetStub.should.have.callCount(1);
      axiosGetStub.should.have.calledWith(sinon.match.string, sinon.match.has('params', {}));
      expect(error).to.be.a('null');
      expect(result.length).to.be.equal(2);
      expect(result[0]).to.be.an.instanceof(PackageModel);
      expect(result[1]).to.be.an.instanceof(PackageModel);
    });

    test(`Should successfully get all package by username for each instance (with type filter)`, async () => {
      const inputUsername = 'user1';
      const filterModel = new PackageModel();
      filterModel.type = 'isp';
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const outputObj = {
        status: 'success',
        data: [
          {
            id: testObj.identifierGenerator.generateId(),
            username: 'my_username',
            password: 'my_password',
            countIp: 25,
            type: 'isp',
            country: 'GB',
            expireDate: '2021-10-25',
            ipList: [],
            isEnable: true,
          },
          {
            id: testObj.identifierGenerator.generateId(),
            username: 'my_username',
            password: 'my_password',
            countIp: 10,
            type: 'isp',
            country: 'GB',
            expireDate: '2021-08-25',
            ipList: [],
            isEnable: true,
          },
        ],
      };
      axiosGetStub.resolves({ data: outputObj });

      const [error, result] = await testObj.proxyServerApiRepository.getAllPackageByUsername(
        inputUsername,
        filterModel,
        inputServerModel,
      );

      axiosGetStub.should.have.callCount(1);
      axiosGetStub.should.have.calledWith(
        sinon.match.string,
        sinon.match.hasNested('params.type', filterModel.type),
      );
      expect(error).to.be.a('null');
      expect(result.length).to.be.equal(2);
      expect(result[0]).to.be.an.instanceof(PackageModel);
      expect(result[1]).to.be.an.instanceof(PackageModel);
    });

    test(`Should successfully get all package by username for each instance (with type country)`, async () => {
      const inputUsername = 'user1';
      const filterModel = new PackageModel();
      filterModel.country = 'GB';
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const outputObj = {
        status: 'success',
        data: [
          {
            id: testObj.identifierGenerator.generateId(),
            username: 'my_username',
            password: 'my_password',
            countIp: 25,
            type: 'isp',
            country: 'GB',
            expireDate: '2021-10-25',
            ipList: [],
            isEnable: true,
          },
          {
            id: testObj.identifierGenerator.generateId(),
            username: 'my_username',
            password: 'my_password',
            countIp: 10,
            type: 'isp',
            country: 'GB',
            expireDate: '2021-08-25',
            ipList: [],
            isEnable: true,
          },
        ],
      };
      axiosGetStub.resolves({ data: outputObj });

      const [error, result] = await testObj.proxyServerApiRepository.getAllPackageByUsername(
        inputUsername,
        filterModel,
        inputServerModel,
      );

      axiosGetStub.should.have.callCount(1);
      axiosGetStub.should.have.calledWith(
        sinon.match.string,
        sinon.match.hasNested('params.country', filterModel.country),
      );
      expect(error).to.be.a('null');
      expect(result.length).to.be.equal(2);
      expect(result[0]).to.be.an.instanceof(PackageModel);
      expect(result[1]).to.be.an.instanceof(PackageModel);
    });

    test(`Should successfully get all package by username for each instance (with type status)`, async () => {
      const inputUsername = 'user1';
      const filterModel = new PackageModel();
      filterModel.status = PackageModel.STATUS_ENABLE;
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const outputObj = {
        status: 'success',
        data: [
          {
            id: testObj.identifierGenerator.generateId(),
            username: 'my_username',
            password: 'my_password',
            countIp: 25,
            type: 'isp',
            country: 'GB',
            expireDate: '2021-10-25',
            ipList: [],
            isEnable: true,
          },
          {
            id: testObj.identifierGenerator.generateId(),
            username: 'my_username',
            password: 'my_password',
            countIp: 10,
            type: 'isp',
            country: 'GB',
            expireDate: '2021-08-25',
            ipList: [],
            isEnable: true,
          },
        ],
      };
      axiosGetStub.resolves({ data: outputObj });

      const [error, result] = await testObj.proxyServerApiRepository.getAllPackageByUsername(
        inputUsername,
        filterModel,
        inputServerModel,
      );

      axiosGetStub.should.have.callCount(1);
      axiosGetStub.should.have.calledWith(
        sinon.match.string,
        sinon.match.hasNested('params.status', filterModel.status),
      );
      expect(error).to.be.a('null');
      expect(result.length).to.be.equal(2);
      expect(result[0]).to.be.an.instanceof(PackageModel);
      expect(result[1]).to.be.an.instanceof(PackageModel);
    });
  });

  suite(`Sync package by id`, () => {
    test(`Should error sync package by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const apiError = new Error('API call error');
      axiosPostStub.throws(apiError);

      const [error] = await testObj.proxyServerApiRepository.syncPackageById(
        inputId,
        inputServerModel,
      );

      axiosPostStub.should.have.callCount(1);
      axiosPostStub.should.have.calledWith(sinon.match.string);
      expect(error).to.be.an.instanceof(ApiCallException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully sync package by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      axiosPostStub.resolves();

      const [error] = await testObj.proxyServerApiRepository.syncPackageById(
        inputId,
        inputServerModel,
      );

      axiosPostStub.should.have.callCount(1);
      axiosPostStub.should.have.calledWith(sinon.match.string);
      expect(error).to.be.a('null');
    });
  });

  suite(`Add new user`, () => {
    test(`Should error add new user`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'user1';
      inputModel.password = 'password';
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const apiError = new Error('API call error');
      axiosPostStub.throws(apiError);

      const [error] = await testObj.proxyServerApiRepository.addUser(inputModel, inputServerModel);

      axiosPostStub.should.have.callCount(1);
      axiosPostStub.should.have.calledWith(
        sinon.match.string,
        sinon.match
          .has('username', inputModel.username)
          .and(sinon.match.has('password', inputModel.password)),
      );
      expect(error).to.be.an.instanceof(ApiCallException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully add new user`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'user1';
      inputModel.password = 'password';
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      axiosPostStub.resolves();

      const [error] = await testObj.proxyServerApiRepository.addUser(inputModel, inputServerModel);

      axiosPostStub.should.have.callCount(1);
      axiosPostStub.should.have.calledWith(
        sinon.match.string,
        sinon.match
          .has('username', inputModel.username)
          .and(sinon.match.has('password', inputModel.password)),
      );
      expect(error).to.be.a('null');
    });
  });

  suite(`Change password of user`, () => {
    test(`Should error change password of user`, async () => {
      const inputUsername = 'user1';
      const inputPassword = 'password';
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const apiError = new Error('API call error');
      axiosPutStub.throws(apiError);

      const [error] = await testObj.proxyServerApiRepository.changeUserPassword(
        inputUsername,
        inputPassword,
        inputServerModel,
      );

      axiosPutStub.should.have.callCount(1);
      axiosPutStub.should.have.calledWith(
        sinon.match.string,
        sinon.match.has('password', inputPassword),
      );
      expect(error).to.be.an.instanceof(ApiCallException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully change password of user`, async () => {
      const inputUsername = 'user1';
      const inputPassword = 'password';
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      axiosPutStub.resolves();

      const [error] = await testObj.proxyServerApiRepository.changeUserPassword(
        inputUsername,
        inputPassword,
        inputServerModel,
      );

      axiosPutStub.should.have.callCount(1);
      axiosPutStub.should.have.calledWith(
        sinon.match.string,
        sinon.match.has('password', inputPassword),
      );
      expect(error).to.be.a('null');
    });
  });

  suite(`Change user status`, () => {
    test(`Should error change user status`, async () => {
      const inputUsername = 'user1';
      const inputStatus = false;
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const apiError = new Error('API call error');
      axiosPutStub.throws(apiError);

      const [error] = await testObj.proxyServerApiRepository.changeUserStatus(
        inputUsername,
        inputStatus,
        inputServerModel,
      );

      axiosPutStub.should.have.callCount(1);
      axiosPutStub.should.have.calledWith(sinon.match.string);
      expect(error).to.be.an.instanceof(ApiCallException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully change user status to disable`, async () => {
      const inputUsername = 'user1';
      const inputStatus = false;
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      axiosPutStub.resolves();

      const [error] = await testObj.proxyServerApiRepository.changeUserStatus(
        inputUsername,
        inputStatus,
        inputServerModel,
      );

      axiosPutStub.should.have.callCount(1);
      axiosPutStub.should.have.calledWith(sinon.match(/disable/));
      expect(error).to.be.a('null');
    });

    test(`Should successfully change user status to enable`, async () => {
      const inputUsername = 'user1';
      const inputStatus = true;
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      axiosPutStub.resolves();

      const [error] = await testObj.proxyServerApiRepository.changeUserStatus(
        inputUsername,
        inputStatus,
        inputServerModel,
      );

      axiosPutStub.should.have.callCount(1);
      axiosPutStub.should.have.calledWith(sinon.match(/enable/));
      expect(error).to.be.a('null');
    });
  });

  suite(`Get all interface of server`, () => {
    test(`Should error get all interface of server`, async () => {
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const apiError = new Error('API call error');
      axiosGetStub.throws(apiError);

      const [error] = await testObj.proxyServerApiRepository.getAllInterfaceOfServer(
        inputServerModel,
      );

      axiosGetStub.should.have.callCount(1);
      axiosGetStub.should.have.calledWith(sinon.match.string);
      expect(error).to.be.an.instanceof(ApiCallException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully get all interface of server for each instance`, async () => {
      const inputServerModel = new ServerModel();
      inputServerModel.name = 'server-2';
      inputServerModel.hostIpAddress = '10.10.10.2';
      inputServerModel.hostApiPort = 8080;
      const outputObj = {
        status: 'success',
        data: [
          {
            hostname: 'host1',
            interfaceName: 'eth01',
            interfacePrefix: 'eth01',
            ipList: ['192.168.1.1'],
          },
          {
            hostname: 'host1',
            interfaceName: 'eth01:2',
            interfacePrefix: 'eth01',
            ipList: ['192.168.1.2'],
          },
        ],
      };
      axiosGetStub.resolves({ data: outputObj });

      const [error, result] = await testObj.proxyServerApiRepository.getAllInterfaceOfServer(
        inputServerModel,
      );

      axiosGetStub.should.have.callCount(1);
      axiosGetStub.should.have.calledWith(sinon.match.string);
      expect(error).to.be.a('null');
      expect(result.length).to.be.equal(2);
      expect(result[0]).to.be.an.instanceof(IpInterfaceModel);
      expect(result[1]).to.be.an.instanceof(IpInterfaceModel);
    });
  });
});
