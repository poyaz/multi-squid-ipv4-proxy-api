/**
 * Created by pooya on 3/29/22.
 */

/**
 * Created by pooya on 2/21/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const ServerModel = require('~src/core/model/serverModel');
const IpInterfaceModel = require('~src/core/model/ipInterfaceModel');
const IServerService = require('~src/core/interface/iServerService');
const UnknownException = require('~src/core/exception/unknownException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`FindClusterServerService`, () => {
  setup(() => {
    const {
      serverService,
      serverApiRepository,
      findClusterServerService,
    } = helper.fakeFindClusterServerService('10.10.10.4');

    testObj.serverService = serverService;
    testObj.serverApiRepository = serverApiRepository;
    testObj.findClusterServerService = findClusterServerService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
  });

  suite(`Get all`, () => {
    test(`Should error get all server`, async () => {
      testObj.serverService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterServerService.getAll();

      testObj.serverService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful get all server`, async () => {
      const outputModel1 = new ServerModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.name = 'server-1';
      outputModel1.ipRange = ['192.168.1.1/32', '192.168.2.1/24'];
      outputModel1.hostIpAddress = '10.10.10.1';
      outputModel1.hostApiPort = 8080;
      outputModel1.isEnable = true;
      outputModel1.insertDate = new Date();
      testObj.serverService.getAll.resolves([null, [outputModel1]]);

      const [error, result] = await testObj.findClusterServerService.getAll();

      testObj.serverService.getAll.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result.length).to.be.eq(1);
      expect(result[0]).to.be.instanceof(ServerModel);
    });
  });

  suite(`Get all interface of server`, () => {
    test(`Should error get all interface of server when get clusters info`, async () => {
      testObj.serverService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterServerService.getAllInterface();

      testObj.serverService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully get all interface of server in current instance because not found any server`, async () => {
      testObj.serverService.getAll.resolves([null, []]);
      const outputModelIpInterface1 = new IpInterfaceModel();
      outputModelIpInterface1.hostname = 'host1';
      outputModelIpInterface1.interfaceName = 'ens192';
      outputModelIpInterface1.interfacePrefix = 'ens192';
      outputModelIpInterface1.ipList = ['192.168.1.1'];
      testObj.serverService.getAllInterface.resolves([null, [outputModelIpInterface1]]);

      const [error, result] = await testObj.findClusterServerService.getAllInterface();

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.serverService.getAllInterface.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result.length).to.be.eq(1);
      expect(result[0]).to.be.instanceof(IpInterfaceModel);
      expect(result[0]).to.have.include({
        hostname: 'host1',
        interfaceName: 'ens192',
        interfacePrefix: 'ens192',
      });
      expect(result[0].ipList).to.have.deep.equal(['192.168.1.1']);
    });

    test(`Should error get all interface of server when send request has been fail in all server or at least one server`, async () => {
      const outputServerModel1 = new ServerModel();
      outputServerModel1.name = 'server-1';
      outputServerModel1.hostIpAddress = '10.10.10.1';
      outputServerModel1.hostApiPort = 8080;
      outputServerModel1.isEnable = true;
      const outputServerModel2 = new ServerModel();
      outputServerModel2.name = 'server-2';
      outputServerModel2.hostIpAddress = '10.10.10.2';
      outputServerModel2.hostApiPort = 8080;
      outputServerModel2.isEnable = false;
      const outputServerModel3 = new ServerModel();
      outputServerModel3.name = 'server-3';
      outputServerModel3.hostIpAddress = '10.10.10.3';
      outputServerModel3.hostApiPort = 8080;
      outputServerModel3.isEnable = true;
      const outputServerModel4 = new ServerModel();
      outputServerModel4.name = 'server-4';
      outputServerModel4.hostIpAddress = '10.10.10.4';
      outputServerModel4.hostApiPort = 8080;
      outputServerModel4.isEnable = true;
      testObj.serverService.getAll.resolves([
        null,
        [outputServerModel1, outputServerModel2, outputServerModel3, outputServerModel4],
      ]);
      const outputModelIpInterface1 = new IpInterfaceModel();
      outputModelIpInterface1.hostname = 'host1';
      outputModelIpInterface1.interfaceName = 'ens192';
      outputModelIpInterface1.interfacePrefix = 'ens192';
      outputModelIpInterface1.ipList = ['192.168.1.1'];
      testObj.serverService.getAllInterface.resolves([null, [outputModelIpInterface1]]);
      testObj.serverApiRepository.getAllInterfaceOfServer.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterServerService.getAllInterface();

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.serverService.getAllInterface.should.have.callCount(1);
      testObj.serverApiRepository.getAllInterfaceOfServer.should.have.callCount(2);
      testObj.serverApiRepository.getAllInterfaceOfServer.should.have.calledWith(
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error get all interface of server in all instance`, async () => {
      const outputServerModel1 = new ServerModel();
      outputServerModel1.name = 'server-1';
      outputServerModel1.hostIpAddress = '10.10.10.1';
      outputServerModel1.hostApiPort = 8080;
      outputServerModel1.isEnable = true;
      const outputServerModel2 = new ServerModel();
      outputServerModel2.name = 'server-2';
      outputServerModel2.hostIpAddress = '10.10.10.2';
      outputServerModel2.hostApiPort = 8080;
      outputServerModel2.isEnable = false;
      const outputServerModel3 = new ServerModel();
      outputServerModel3.name = 'server-3';
      outputServerModel3.hostIpAddress = '10.10.10.3';
      outputServerModel3.hostApiPort = 8080;
      outputServerModel3.isEnable = true;
      const outputServerModel4 = new ServerModel();
      outputServerModel4.name = 'server-4';
      outputServerModel4.hostIpAddress = '10.10.10.4';
      outputServerModel4.hostApiPort = 8080;
      outputServerModel4.isEnable = true;
      testObj.serverService.getAll.resolves([
        null,
        [outputServerModel1, outputServerModel2, outputServerModel3, outputServerModel4],
      ]);
      const outputModelIpInterface1 = new IpInterfaceModel();
      outputModelIpInterface1.hostname = 'host4';
      outputModelIpInterface1.interfaceName = 'ens192';
      outputModelIpInterface1.interfacePrefix = 'ens192';
      outputModelIpInterface1.ipList = ['192.168.1.4'];
      testObj.serverService.getAllInterface.resolves([null, [outputModelIpInterface1]]);
      const outputInstanceModelIpInterface1 = new IpInterfaceModel();
      outputInstanceModelIpInterface1.hostname = 'host1';
      outputInstanceModelIpInterface1.interfaceName = 'ens192';
      outputInstanceModelIpInterface1.interfacePrefix = 'ens192';
      outputInstanceModelIpInterface1.ipList = ['192.168.1.1'];
      const outputInstanceModelIpInterface2 = new IpInterfaceModel();
      outputInstanceModelIpInterface2.hostname = 'host3';
      outputInstanceModelIpInterface2.interfaceName = 'ens192';
      outputInstanceModelIpInterface2.interfacePrefix = 'ens192';
      outputInstanceModelIpInterface2.ipList = ['192.168.1.3'];
      testObj.serverApiRepository.getAllInterfaceOfServer
        .onCall(0)
        .resolves([null, [outputInstanceModelIpInterface1]])
        .onCall(1)
        .resolves([null, [outputInstanceModelIpInterface2]]);

      const [error, result] = await testObj.findClusterServerService.getAllInterface();

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.serverService.getAllInterface.should.have.callCount(1);
      testObj.serverApiRepository.getAllInterfaceOfServer.should.have.callCount(2);
      testObj.serverApiRepository.getAllInterfaceOfServer.should.have.calledWith(
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.a('null');
      expect(result.length).to.be.eq(3);
      expect(result[0]).to.be.instanceof(IpInterfaceModel);
      expect(result[0]).to.have.include({
        hostname: 'host4',
        interfaceName: 'ens192',
        interfacePrefix: 'ens192',
      });
      expect(result[0].ipList).to.have.deep.equal(['192.168.1.4']);
      expect(result[1]).to.be.instanceof(IpInterfaceModel);
      expect(result[1]).to.have.include({
        hostname: 'host1',
        interfaceName: 'ens192',
        interfacePrefix: 'ens192',
      });
      expect(result[1].ipList).to.have.deep.equal(['192.168.1.1']);
      expect(result[2]).to.be.instanceof(IpInterfaceModel);
      expect(result[2]).to.have.include({
        hostname: 'host3',
        interfaceName: 'ens192',
        interfacePrefix: 'ens192',
      });
      expect(result[2].ipList).to.have.deep.equal(['192.168.1.3']);
    });
  });

  suite(`Find server instance`, () => {
    test(`Should error find server instance`, async () => {
      testObj.serverService.findInstanceExecute.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterServerService.findInstanceExecute();

      testObj.serverService.findInstanceExecute.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful find server instance`, async () => {
      const inputIpMask = '192.168.1.1/24';
      const outputModel = new ServerModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.name = 'server-1';
      outputModel.ipRange = ['192.168.1.1/32', '192.168.2.1/24'];
      outputModel.hostIpAddress = '10.10.10.1';
      outputModel.hostApiPort = 8080;
      outputModel.isEnable = true;
      outputModel.insertDate = new Date();
      testObj.serverService.findInstanceExecute.resolves([
        null,
        IServerService.EXTERNAL_SERVER_INSTANCE,
        outputModel,
      ]);

      const [error, result, server] = await testObj.findClusterServerService.findInstanceExecute(
        inputIpMask,
      );

      testObj.serverService.findInstanceExecute.should.have.callCount(1);
      testObj.serverService.findInstanceExecute.should.have.calledWith(sinon.match(inputIpMask));
      expect(error).to.be.a('null');
      expect(result).to.be.equal(IServerService.EXTERNAL_SERVER_INSTANCE);
      expect(server).to.be.an.instanceof(ServerModel);
    });
  });

  suite(`Add new server`, () => {
    test(`Should error add new server`, async () => {
      const inputModel = new ServerModel();
      inputModel.name = 'server-1';
      inputModel.ipRange = ['192.168.1.1/32', '192.168.2.1/24'];
      inputModel.hostIpAddress = '10.10.10.1';
      inputModel.hostApiPort = 8080;
      inputModel.isEnable = true;
      inputModel.insertDate = new Date();
      testObj.serverService.add.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterServerService.add(inputModel);

      testObj.serverService.add.should.have.callCount(1);
      testObj.serverService.add.should.have.calledWith(sinon.match.instanceOf(ServerModel));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful add new server`, async () => {
      const inputModel = new ServerModel();
      inputModel.name = 'server-1';
      inputModel.ipRange = ['192.168.1.1/32', '192.168.2.1/24'];
      inputModel.hostIpAddress = '10.10.10.1';
      inputModel.hostApiPort = 8080;
      inputModel.isEnable = true;
      inputModel.insertDate = new Date();
      const outputModel = new ServerModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.name = inputModel.name;
      outputModel.ipRange = inputModel.ipRange;
      outputModel.hostIpAddress = inputModel.hostIpAddress;
      outputModel.hostApiPort = inputModel.hostApiPort;
      outputModel.isEnable = true;
      outputModel.insertDate = new Date();
      testObj.serverService.add.resolves([null, outputModel]);

      const [error, result] = await testObj.findClusterServerService.add(inputModel);

      testObj.serverService.add.should.have.callCount(1);
      testObj.serverService.add.should.have.calledWith(sinon.match.instanceOf(ServerModel));
      expect(error).to.be.a('null');
      expect(result).to.be.instanceof(ServerModel);
      expect(result.id).to.be.equal(testObj.identifierGenerator.generateId());
    });
  });

  suite(`Update server`, () => {
    test(`Should error update server`, async () => {
      const inputModel = new ServerModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.name = 'server-1';
      inputModel.ipRange = ['192.168.1.1/32', '192.168.2.1/24'];
      inputModel.hostIpAddress = '10.10.10.1';
      inputModel.hostApiPort = 8080;
      testObj.serverService.update.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterServerService.update(inputModel);

      testObj.serverService.update.should.have.callCount(1);
      testObj.serverService.update.should.have.calledWith(sinon.match.instanceOf(ServerModel));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful update server`, async () => {
      const inputModel = new ServerModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.name = 'server-1';
      inputModel.ipRange = ['192.168.1.1/32', '192.168.2.1/24'];
      inputModel.hostIpAddress = '10.10.10.1';
      inputModel.hostApiPort = 8080;
      const outputModel1 = new ServerModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.name = 'server-1';
      outputModel1.ipRange = ['192.168.1.1/32', '192.168.2.1/24'];
      outputModel1.hostIpAddress = '10.10.10.1';
      outputModel1.hostApiPort = 8080;
      outputModel1.isEnable = true;
      outputModel1.insertDate = new Date();
      testObj.serverService.update.resolves([null]);

      const [error] = await testObj.findClusterServerService.update(inputModel);

      testObj.serverService.update.should.have.callCount(1);
      testObj.serverService.update.should.have.calledWith(sinon.match.instanceOf(ServerModel));
      expect(error).to.be.a('null');
    });
  });

  suite(`Delete server`, () => {
    test(`Should error delete server`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.serverService.delete.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterServerService.delete(inputId);

      testObj.serverService.delete.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful delete server`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.serverService.delete.resolves([null]);

      const [error] = await testObj.findClusterServerService.delete(inputId);

      testObj.serverService.delete.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });
});
