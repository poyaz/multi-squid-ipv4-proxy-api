/**
 * Created by pooya on 8/30/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const { createRequest, createResponse } = require('node-mocks-http');

const helper = require('~src/helper');

const JobModel = require('~src/core/model/jobModel');
const IpAddressModel = require('~src/core/model/ipAddressModel');
const UnknownException = require('~src/core/exception/unknownException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
chai.use(chaiAsPromised);

const expect = chai.expect;
const testObj = {};

suite(`ProxyController`, () => {
  setup(() => {
    testObj.req = new createRequest();
    testObj.res = new createResponse();

    const { proxyServerService, proxyController } = helper.fakeProxyController(
      testObj.req,
      testObj.res,
    );

    testObj.proxyServerService = proxyServerService;
    testObj.proxyController = proxyController;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.dateRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/;
    testObj.expireRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
  });

  suite(`Get all proxy ip`, () => {
    test(`Should error get all proxy ip`, async () => {
      testObj.proxyServerService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.proxyController.getAll();

      testObj.proxyServerService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully get all proxy ip`, async () => {
      const outputModel1 = new IpAddressModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.ip = '192.168.1.1';
      outputModel1.port = 8080;
      outputModel1.mask = 24;
      outputModel1.interface = 'ens192';
      outputModel1.gateway = '192.168.1.224';
      outputModel1.insertDate = new Date();
      testObj.proxyServerService.getAll.resolves([null, [outputModel1]]);

      const [error, result] = await testObj.proxyController.getAll();

      testObj.proxyServerService.getAll.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.length(1);
      expect(result[0]).to.be.a('object');
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        ip: '192.168.1.1',
        port: 8080,
        mask: 24,
        interface: 'ens192',
        gateway: '192.168.1.224',
      });
      expect(result[0].insertDate).to.have.match(testObj.dateRegex);
    });
  });

  suite(`Generate ip for proxy`, () => {
    test(`Should error generate ip for proxy`, async () => {
      testObj.req.body = {
        ip: '192.168.1.2',
        mask: 32,
        gateway: '192.168.1.1',
        interface: 'ens192',
      };
      testObj.proxyServerService.add.resolves([new UnknownException()]);

      const [error] = await testObj.proxyController.generateIp();

      testObj.proxyServerService.add.should.have.callCount(1);
      testObj.proxyServerService.add.should.have.calledWith(sinon.match.instanceOf(IpAddressModel));
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully generate ip for proxy with job id`, async () => {
      testObj.req.body = {
        ip: '192.168.1.2',
        mask: 32,
        gateway: '192.168.1.1',
        interface: 'ens192',
      };
      const outputModel = new JobModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      testObj.proxyServerService.add.resolves([null, outputModel]);

      const [error, result] = await testObj.proxyController.generateIp();

      testObj.proxyServerService.add.should.have.callCount(1);
      testObj.proxyServerService.add.should.have.calledWith(sinon.match.instanceOf(IpAddressModel));
      expect(error).to.be.a('null');
      expect(result)
        .to.be.a('object')
        .and.have.include({ jobId: testObj.identifierGenerator.generateId() });
    });
  });

  suite(`Reload all proxy`, () => {
    test(`Should error reload all proxy`, async () => {
      testObj.proxyServerService.reload.resolves([new UnknownException()]);

      const [error] = await testObj.proxyController.reload();

      testObj.proxyServerService.reload.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully reload all proxy`, async () => {
      testObj.proxyServerService.reload.resolves([null]);

      const [error] = await testObj.proxyController.reload();

      testObj.proxyServerService.reload.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });
});
