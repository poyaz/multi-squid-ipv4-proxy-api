/**
 * Created by pooya on 2/13/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const os = require('os');
const networkInterfaces = sinon.stub(os, 'networkInterfaces');

const helper = require('~src/helper');

const ServerModel = require('~src/core/model/serverModel');
const UnknownException = require('~src/core/exception/unknownException');
const NotFoundException = require('~src/core/exception/notFoundException');
const IServerService = require('~src/core/interface/iServerService');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`ServerService`, () => {
  setup(() => {
    const currentInstanceIp = '10.10.10.1';
    const otherInstanceIp = '10.10.10.2';

    const { serverRepository, serverService, otherServerService } = helper.fakeServerService(
      currentInstanceIp,
      otherInstanceIp,
    );

    testObj.currentInstanceIp = currentInstanceIp;
    testObj.otherInstanceIp = otherInstanceIp;
    testObj.serverRepository = serverRepository;
    testObj.serverService = serverService;
    testObj.otherServerService = otherServerService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.networkInterfaces = networkInterfaces;
  });

  teardown(() => {
    testObj.networkInterfaces.restore();
  });

  suite(`Get all server`, () => {
    test(`Should error get all server`, async () => {
      testObj.serverRepository.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.serverService.getAll();

      testObj.serverRepository.getAll.should.have.callCount(1);
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
      testObj.serverRepository.getAll.resolves([null, [outputModel1]]);

      const [error, result] = await testObj.serverService.getAll();

      testObj.serverRepository.getAll.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result.length).to.be.eq(1);
      expect(result[0]).to.be.instanceof(ServerModel);
    });
  });

  suite(`Find server instance`, () => {
    test(`Should error find server when fetch data`, async () => {
      const inputIpMask = '192.168.1.0/29';
      testObj.serverRepository.getByIpAddress.resolves([new UnknownException()]);

      const [error] = await testObj.serverService.findInstanceExecute(inputIpMask);

      testObj.serverRepository.getByIpAddress.should.have.callCount(1);
      testObj.serverRepository.getByIpAddress.should.have.calledWith(sinon.match(inputIpMask));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful return current server when not found any server`, async () => {
      const inputIpMask = '192.168.1.0/29';
      testObj.serverRepository.getByIpAddress.resolves([null, null]);

      const [error, result] = await testObj.serverService.findInstanceExecute(inputIpMask);

      testObj.serverRepository.getByIpAddress.should.have.callCount(1);
      testObj.serverRepository.getByIpAddress.should.have.calledWith(sinon.match(inputIpMask));
      expect(error).to.be.a('null');
      expect(result).to.be.equal(IServerService.INTERNAL_SERVER_INSTANCE);
    });

    test(`Should successful return current server when found server but should stay in current server`, async () => {
      const inputIpMask = '192.168.1.0/29';
      const outputServerModel = new ServerModel();
      outputServerModel.name = 'server-1';
      outputServerModel.ipRange = ['192.168.1.0/29'];
      outputServerModel.hostIpAddress = '10.10.10.1';
      outputServerModel.hostApiPort = 8080;
      outputServerModel.isEnable = true;
      testObj.serverRepository.getByIpAddress.resolves([null, outputServerModel]);

      const [error, result] = await testObj.serverService.findInstanceExecute(inputIpMask);

      testObj.serverRepository.getByIpAddress.should.have.callCount(1);
      testObj.serverRepository.getByIpAddress.should.have.calledWith(sinon.match(inputIpMask));
      expect(error).to.be.a('null');
      expect(result).to.be.equal(IServerService.INTERNAL_SERVER_INSTANCE);
    });

    test(`Should successful return current server when found server with use NAT ip but should stay in current server`, async () => {
      const inputIpMask = '192.168.1.0/29';
      const outputServerModel = new ServerModel();
      outputServerModel.name = 'server-1';
      outputServerModel.ipRange = ['192.168.1.0/29'];
      outputServerModel.hostIpAddress = '123.40.52.6';
      outputServerModel.internalHostIpAddress = '10.10.10.1';
      outputServerModel.hostApiPort = 8080;
      outputServerModel.isEnable = true;
      testObj.serverRepository.getByIpAddress.resolves([null, outputServerModel]);
      testObj.networkInterfaces.returns({ ens192: [{ address: '10.10.10.1' }] });

      const [error, result] = await testObj.serverService.findInstanceExecute(inputIpMask);

      testObj.serverRepository.getByIpAddress.should.have.callCount(1);
      testObj.serverRepository.getByIpAddress.should.have.calledWith(sinon.match(inputIpMask));
      expect(error).to.be.a('null');
      expect(result).to.be.equal(IServerService.INTERNAL_SERVER_INSTANCE);
    });

    test(`Should successful return other server`, async () => {
      const inputIpMask = '192.168.1.0/29';
      const outputServerModel = new ServerModel();
      outputServerModel.name = 'server-1';
      outputServerModel.ipRange = ['192.168.1.0/29'];
      outputServerModel.hostIpAddress = '123.40.52.6';
      outputServerModel.hostApiPort = 8080;
      outputServerModel.isEnable = true;
      testObj.serverRepository.getByIpAddress.resolves([null, outputServerModel]);
      testObj.networkInterfaces.returns({ ens192: [{ address: '10.10.10.1' }] });

      const [error, result] = await testObj.serverService.findInstanceExecute(inputIpMask);

      testObj.serverRepository.getByIpAddress.should.have.callCount(1);
      testObj.serverRepository.getByIpAddress.should.have.calledWith(sinon.match(inputIpMask));
      expect(error).to.be.a('null');
      expect(result).to.be.equal(IServerService.EXTERNAL_SERVER_INSTANCE);
    });
  });

  suite(`Add new server`, () => {
    test(`Should error when add new server`, async () => {
      const inputModel = new ServerModel();
      inputModel.name = 'server-1';
      inputModel.ipRange = ['192.168.1.1/32', '192.168.2.1/24'];
      inputModel.hostIpAddress = '10.10.10.1';
      inputModel.hostApiPort = 8080;
      inputModel.isEnable = true;
      inputModel.insertDate = new Date();
      testObj.serverRepository.add.resolves([new UnknownException()]);

      const [error] = await testObj.serverService.add(inputModel);

      testObj.serverRepository.add.should.have.callCount(1);
      testObj.serverRepository.add.should.have.calledWith(sinon.match.instanceOf(ServerModel));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful when add new server`, async () => {
      const inputModel = new ServerModel();
      inputModel.name = 'server-1';
      inputModel.ipRange = ['192.168.1.1/32', '192.168.2.1/24'];
      inputModel.hostIpAddress = '10.10.10.1';
      inputModel.hostApiPort = 8080;
      const outputModel = new ServerModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.name = inputModel.name;
      outputModel.ipRange = inputModel.ipRange;
      outputModel.hostIpAddress = inputModel.hostIpAddress;
      outputModel.hostApiPort = inputModel.hostApiPort;
      outputModel.isEnable = true;
      outputModel.insertDate = new Date();
      testObj.serverRepository.add.resolves([null, outputModel]);

      const [error, result] = await testObj.serverService.add(inputModel);

      testObj.serverRepository.add.should.have.callCount(1);
      testObj.serverRepository.add.should.have.calledWith(sinon.match.instanceOf(ServerModel));
      expect(error).to.be.a('null');
      expect(result).to.be.instanceof(ServerModel);
      expect(result.id).to.be.equal(testObj.identifierGenerator.generateId());
    });
  });

  suite(`Update server`, () => {
    test(`Should error update when check server id exist`, async () => {
      const inputModel = new ServerModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.name = 'server-1';
      inputModel.ipRange = ['192.168.1.1/32', '192.168.2.1/24'];
      inputModel.hostIpAddress = '10.10.10.1';
      inputModel.hostApiPort = 8080;
      testObj.serverRepository.getById.resolves([new UnknownException()]);

      const [error] = await testObj.serverService.update(inputModel);

      testObj.serverRepository.getById.should.have.callCount(1);
      testObj.serverRepository.getById.should.have.calledWith(sinon.match(inputModel.id));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error update when server id not exist`, async () => {
      const inputModel = new ServerModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.name = 'server-1';
      inputModel.ipRange = ['192.168.1.1/32', '192.168.2.1/24'];
      inputModel.hostIpAddress = '10.10.10.1';
      inputModel.hostApiPort = 8080;
      testObj.serverRepository.getById.resolves([null, null]);

      const [error] = await testObj.serverService.update(inputModel);

      testObj.serverRepository.getById.should.have.callCount(1);
      testObj.serverRepository.getById.should.have.calledWith(sinon.match(inputModel.id));
      expect(error).to.be.an.instanceof(NotFoundException);
      expect(error).to.have.property('httpCode', 404);
    });

    test(`Should error update`, async () => {
      const inputModel = new ServerModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.name = 'server-1';
      inputModel.ipRange = ['192.168.1.1/32', '192.168.2.1/24'];
      inputModel.hostIpAddress = '10.10.10.1';
      inputModel.hostApiPort = 8080;
      const outputModel = new ServerModel();
      outputModel.id = inputModel.id;
      testObj.serverRepository.getById.resolves([null, outputModel]);
      testObj.serverRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.serverService.update(inputModel);

      testObj.serverRepository.getById.should.have.callCount(1);
      testObj.serverRepository.getById.should.have.calledWith(sinon.match(inputModel.id));
      testObj.serverRepository.update.should.have.callCount(1);
      testObj.serverRepository.update.should.have.calledWith(sinon.match.instanceOf(ServerModel));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful update`, async () => {
      const inputModel = new ServerModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.name = 'server-1';
      inputModel.ipRange = ['192.168.1.1/32', '192.168.2.1/24'];
      inputModel.hostIpAddress = '10.10.10.1';
      inputModel.hostApiPort = 8080;
      const outputModel = new ServerModel();
      outputModel.id = inputModel.id;
      testObj.serverRepository.getById.resolves([null, outputModel]);
      testObj.serverRepository.update.resolves([null]);

      const [error] = await testObj.serverService.update(inputModel);

      testObj.serverRepository.getById.should.have.callCount(1);
      testObj.serverRepository.getById.should.have.calledWith(sinon.match(inputModel.id));
      testObj.serverRepository.update.should.have.callCount(1);
      testObj.serverRepository.update.should.have.calledWith(sinon.match.instanceOf(ServerModel));
      expect(error).to.be.a('null');
    });
  });

  suite(`Delete server`, () => {
    test(`Should error delete when check server id exist`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.serverRepository.getById.resolves([new UnknownException()]);

      const [error] = await testObj.serverService.delete(inputId);

      testObj.serverRepository.getById.should.have.callCount(1);
      testObj.serverRepository.getById.should.have.calledWith(sinon.match(inputId));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error delete when server id not exist`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.serverRepository.getById.resolves([null, null]);

      const [error] = await testObj.serverService.delete(inputId);

      testObj.serverRepository.getById.should.have.callCount(1);
      testObj.serverRepository.getById.should.have.calledWith(sinon.match(inputId));
      expect(error).to.be.an.instanceof(NotFoundException);
      expect(error).to.have.property('httpCode', 404);
    });

    test(`Should error delete when server id not exist`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputModel = new ServerModel();
      outputModel.id = inputId;
      testObj.serverRepository.getById.resolves([null, outputModel]);
      testObj.serverRepository.delete.resolves([new UnknownException()]);

      const [error] = await testObj.serverService.delete(inputId);

      testObj.serverRepository.getById.should.have.callCount(1);
      testObj.serverRepository.getById.should.have.calledWith(sinon.match(inputId));
      testObj.serverRepository.delete.should.have.callCount(1);
      testObj.serverRepository.delete.should.have.calledWith(sinon.match(inputId));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error delete when server id not exist`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputModel = new ServerModel();
      outputModel.id = inputId;
      testObj.serverRepository.getById.resolves([null, outputModel]);
      testObj.serverRepository.delete.resolves([null]);

      const [error] = await testObj.serverService.delete(inputId);

      testObj.serverRepository.getById.should.have.callCount(1);
      testObj.serverRepository.getById.should.have.calledWith(sinon.match(inputId));
      testObj.serverRepository.delete.should.have.callCount(1);
      testObj.serverRepository.delete.should.have.calledWith(sinon.match(inputId));
      expect(error).to.be.a('null');
    });
  });
});
