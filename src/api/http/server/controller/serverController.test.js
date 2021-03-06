/**
 * Created by pooya on 2/12/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const { createRequest, createResponse } = require('node-mocks-http');

const helper = require('~src/helper');

const ServerModel = require('~src/core/model/serverModel');
const IpInterfaceModel = require('~src/core/model/ipInterfaceModel');
const UnknownException = require('~src/core/exception/unknownException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
chai.use(chaiAsPromised);

const expect = chai.expect;
const testObj = {};

suite(`ServerController`, () => {
  setup(() => {
    testObj.req = new createRequest();
    testObj.res = new createResponse();

    const {
      serverService,
      findClusterServerService,
      serverController,
    } = helper.fakeServerController(testObj.req, testObj.res);

    testObj.serverService = serverService;
    testObj.findClusterServerService = findClusterServerService;
    testObj.serverController = serverController;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.dateRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/;
    testObj.expireRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
  });

  suite(`Get all server list`, () => {
    test(`Should error get all server list`, async () => {
      testObj.serverService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.serverController.getAll();

      testObj.serverService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully get all server list`, async () => {
      const outputModel1 = new ServerModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.name = 'server-1';
      outputModel1.ipRange = ['192.168.1.1/32', '192.168.2.1/24'];
      outputModel1.hostIpAddress = '10.10.10.1';
      outputModel1.internalHostIpAddress = '10.10.10.1';
      outputModel1.hostApiPort = 8080;
      outputModel1.isEnable = true;
      outputModel1.insertDate = new Date();
      testObj.serverService.getAll.resolves([null, [outputModel1]]);

      const [error, result] = await testObj.serverController.getAll();

      testObj.serverService.getAll.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.length(1);
      expect(result[0]).to.be.a('object');
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        name: 'server-1',
        hostIpAddress: '10.10.10.1',
        internalHostIpAddress: '10.10.10.1',
        hostApiPort: 8080,
        isEnable: true,
      });
      expect(result[0].insertDate).to.have.match(testObj.dateRegex);
    });
  });

  suite(`Get all interface of server`, () => {
    test(`Should error get all interface of server`, async () => {
      testObj.findClusterServerService.getAllInterface.resolves([new UnknownException()]);

      const [error] = await testObj.serverController.getAllInterface();

      testObj.findClusterServerService.getAllInterface.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully get all interface of server`, async () => {
      const outputModel1 = new IpInterfaceModel();
      outputModel1.hostname = 'host1';
      outputModel1.interfaceName = 'eth0';
      outputModel1.interfacePrefix = 'eth0';
      outputModel1.ipList = ['192.168.1.1', '192.168.1.2'];
      testObj.findClusterServerService.getAllInterface.resolves([null, [outputModel1]]);

      const [error, result] = await testObj.serverController.getAllInterface();

      testObj.findClusterServerService.getAllInterface.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.length(1);
      expect(result[0]).to.be.a('object');
      expect(result[0]).to.have.include({
        hostname: 'host1',
        interfaceName: 'eth0',
        interfacePrefix: 'eth0',
      });
      expect(result[0].ipList).to.have.deep.equal(['192.168.1.1', '192.168.1.2']);
    });
  });

  suite(`Get all interface of server in self instance`, () => {
    test(`Should error get all interface of server in self instance`, async () => {
      testObj.serverService.getAllInterface.resolves([new UnknownException()]);

      const [error] = await testObj.serverController.getAllInterfaceInSelfInstance();

      testObj.serverService.getAllInterface.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully get all interface of server in self instance`, async () => {
      const outputModel1 = new IpInterfaceModel();
      outputModel1.hostname = 'host1';
      outputModel1.interfaceName = 'eth0';
      outputModel1.interfacePrefix = 'eth0';
      outputModel1.ipList = ['192.168.1.1', '192.168.1.2'];
      testObj.serverService.getAllInterface.resolves([null, [outputModel1]]);

      const [error, result] = await testObj.serverController.getAllInterfaceInSelfInstance();

      testObj.serverService.getAllInterface.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.length(1);
      expect(result[0]).to.be.a('object');
      expect(result[0]).to.have.include({
        hostname: 'host1',
        interfaceName: 'eth0',
        interfacePrefix: 'eth0',
      });
      expect(result[0].ipList).to.have.deep.equal(['192.168.1.1', '192.168.1.2']);
    });
  });

  suite(`Add new server`, () => {
    test(`Should error add new server`, async () => {
      testObj.req.body = {
        name: 'server-1',
        ipRange: ['192.168.1.1/32', '192.168.2.1/24'],
        hostIpAddress: '10.10.10.1',
        internalHostIpAddress: '10.10.10.1',
        hostApiPort: 8080,
      };
      testObj.serverService.add.resolves([new UnknownException()]);

      const [error] = await testObj.serverController.add();

      testObj.serverService.add.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successful add new server`, async () => {
      testObj.req.body = {
        name: 'server-1',
        ipRange: ['192.168.1.1/32', '192.168.2.1/24'],
        hostIpAddress: '10.10.10.1',
        internalHostIpAddress: '10.10.10.1',
        hostApiPort: 8080,
      };
      const outputModel = new ServerModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.name = 'server-1';
      outputModel.ipRange = ['192.168.1.1/32', '192.168.2.1/24'];
      outputModel.hostIpAddress = '10.10.10.1';
      outputModel.internalHostIpAddress = '10.10.10.1';
      outputModel.hostApiPort = 8080;
      outputModel.isEnable = true;
      outputModel.insertDate = new Date();
      testObj.serverService.add.resolves([null, outputModel]);

      const [error, result] = await testObj.serverController.add();

      testObj.serverService.add.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.a('object');
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        name: 'server-1',
        hostIpAddress: '10.10.10.1',
        internalHostIpAddress: '10.10.10.1',
        hostApiPort: 8080,
        isEnable: true,
      });
      expect(result.insertDate).to.have.match(testObj.dateRegex);
    });
  });

  suite(`Update server`, () => {
    test(`Should error update server`, async () => {
      testObj.req.params = { id: testObj.identifierGenerator.generateId() };
      testObj.req.body = {
        name: 'server-1',
        ipRange: ['192.168.1.1/32', '192.168.2.1/24'],
        hostIpAddress: '10.10.10.1',
        internalHostIpAddress: '10.10.10.1',
        hostApiPort: 8080,
        isEnable: true,
      };
      testObj.serverService.update.resolves([new UnknownException()]);

      const [error] = await testObj.serverController.update();

      testObj.serverService.update.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should error update server`, async () => {
      testObj.req.params = { id: testObj.identifierGenerator.generateId() };
      testObj.req.body = {
        name: 'server-1',
        ipRange: ['192.168.1.1/32', '192.168.2.1/24'],
        hostIpAddress: '10.10.10.1',
        internalHostIpAddress: '10.10.10.1',
        hostApiPort: 8080,
        isEnable: true,
      };
      testObj.serverService.update.resolves([null]);

      const [error] = await testObj.serverController.update();

      testObj.serverService.update.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });

  suite(`Delete server`, () => {
    test(`Should error delete server`, async () => {
      testObj.req.params = { id: testObj.identifierGenerator.generateId() };
      testObj.serverService.delete.resolves([new UnknownException()]);

      const [error] = await testObj.serverController.delete();

      testObj.serverService.delete.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successful delete server`, async () => {
      testObj.req.params = { id: testObj.identifierGenerator.generateId() };
      testObj.serverService.delete.resolves([null]);

      const [error] = await testObj.serverController.delete();

      testObj.serverService.delete.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });
});
