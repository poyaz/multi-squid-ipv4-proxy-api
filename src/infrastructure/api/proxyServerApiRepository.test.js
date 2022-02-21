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
const axiosPostStub = sinon.stub(axios, 'post');

const helper = require('~src/helper');

const JobModel = require('~src/core/model/jobModel');
const ServerModel = require('~src/core/model/serverModel');
const IpAddressModel = require('~src/core/model/ipAddressModel');
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
    const { proxyServerApiRepository } = helper.fakeProxyServerApiRepository();

    testObj.proxyServerApiRepository = proxyServerApiRepository;

    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.fillJobModelSpy = sinon.spy(testObj.proxyServerApiRepository, '_fillJobModel');

    testObj.consoleError = sinon.stub(console, 'error');
  });

  teardown(() => {
    axiosPostStub.resetHistory();
    testObj.consoleError.restore();
  });

  suite(`Generate ip`, () => {
    test(`Should error execute generate ip when unknown error happened`, async () => {
      const inputIpAddressModel = new IpAddressModel();
      inputIpAddressModel.ip = '192.168.1.0';
      inputIpAddressModel.mask = 24;
      inputIpAddressModel.gateway = '192.168.1.1';
      inputIpAddressModel.interface = 'ens192';
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
          .and(sinon.match.has('interface', inputIpAddressModel.interface)),
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
          .and(sinon.match.has('interface', inputIpAddressModel.interface)),
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
          .and(sinon.match.has('interface', inputIpAddressModel.interface)),
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
          .and(sinon.match.has('interface', inputIpAddressModel.interface)),
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
          .and(sinon.match.has('interface', inputIpAddressModel.interface)),
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
          .and(sinon.match.has('interface', inputIpAddressModel.interface)),
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
          .and(sinon.match.has('interface', inputIpAddressModel.interface)),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful execute generate ip `, async () => {
      const inputIpAddressModel = new IpAddressModel();
      inputIpAddressModel.ip = '192.168.1.0';
      inputIpAddressModel.mask = 24;
      inputIpAddressModel.gateway = '192.168.1.1';
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
      axiosPostStub.resolves(outputObj);

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
          .and(sinon.match.has('interface', inputIpAddressModel.interface)),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(JobModel);
      expect(result.id).to.be.equal(testObj.identifierGenerator.generateId());
    });
  });
});
