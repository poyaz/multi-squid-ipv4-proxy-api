/**
 * Created by pooya on 2/14/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const os = require('os');
const networkInterfaces = sinon.stub(os, 'networkInterfaces');

const helper = require('~src/helper');

const ServerModel = require('~src/core/model/serverModel');
const IpAddressModel = require('~src/core/model/ipAddressModel');
const JobModel = require('~src/core/model/jobModel');
const UnknownException = require('~src/core/exception/unknownException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`FindClusterProxyServerService`, () => {
  setup(() => {
    const currentInstanceIp = '10.10.10.1';
    const otherInstanceIp = '10.10.10.2';

    const {
      proxyServerService,
      serverRepository,
      proxyServerApiRepository,
      findClusterProxyServerService,
      otherFindClusterProxyServerService,
    } = helper.fakeFindClusterProxyServerService(currentInstanceIp, otherInstanceIp);

    testObj.currentInstanceIp = currentInstanceIp;
    testObj.otherInstanceIp = otherInstanceIp;
    testObj.proxyServerService = proxyServerService;
    testObj.serverRepository = serverRepository;
    testObj.proxyServerApiRepository = proxyServerApiRepository;
    testObj.findClusterProxyServerService = findClusterProxyServerService;
    testObj.otherFindClusterProxyServerService = otherFindClusterProxyServerService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.networkInterfaces = networkInterfaces;
  });

  teardown(() => {
    testObj.networkInterfaces.restore();
  });

  suite(`Get all`, () => {
    test(`Should error get all`, async () => {
      testObj.proxyServerService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterProxyServerService.getAll();

      testObj.proxyServerService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful get all`, async () => {
      const outputModel1 = new IpAddressModel();
      const outputModel2 = new IpAddressModel();
      testObj.proxyServerService.getAll.resolves([null, [outputModel1, outputModel2]]);

      const [error, result] = await testObj.findClusterProxyServerService.getAll();

      testObj.proxyServerService.getAll.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.length(2);
      expect(result[0]).to.be.an.instanceof(IpAddressModel);
      expect(result[1]).to.be.an.instanceof(IpAddressModel);
    });
  });

  suite(`Add`, () => {
    test(`Should error add when find ip mask in server ipRange`, async () => {
      const inputModel = new IpAddressModel();
      inputModel.ip = '192.168.1.0';
      inputModel.mask = 29;
      inputModel.gateway = '192.168.1.6';
      inputModel.interface = 'ens192';
      testObj.serverRepository.getByIpAddress.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterProxyServerService.add(inputModel);

      testObj.serverRepository.getByIpAddress.should.have.callCount(1);
      testObj.serverRepository.getByIpAddress.should.have.calledWith(
        sinon.match(`${inputModel.ip}/${inputModel.mask}`),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error add when not found any server and execute in current instance`, async () => {
      const inputModel = new IpAddressModel();
      inputModel.ip = '192.168.1.0';
      inputModel.mask = 29;
      inputModel.gateway = '192.168.1.6';
      inputModel.interface = 'ens192';
      testObj.serverRepository.getByIpAddress.resolves([null, null]);
      testObj.proxyServerService.add.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterProxyServerService.add(inputModel);

      testObj.serverRepository.getByIpAddress.should.have.callCount(1);
      testObj.serverRepository.getByIpAddress.should.have.calledWith(
        sinon.match(`${inputModel.ip}/${inputModel.mask}`),
      );
      testObj.proxyServerService.add.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful add in current instance when not found any server`, async () => {
      const inputModel = new IpAddressModel();
      inputModel.ip = '192.168.1.0';
      inputModel.mask = 29;
      inputModel.gateway = '192.168.1.6';
      inputModel.interface = 'ens192';
      testObj.serverRepository.getByIpAddress.resolves([null, null]);
      const outputJobModel = new JobModel();
      outputJobModel.id = testObj.identifierGenerator.generateId();
      testObj.proxyServerService.add.resolves([null, outputJobModel]);

      const [error, result] = await testObj.findClusterProxyServerService.add(inputModel);

      testObj.serverRepository.getByIpAddress.should.have.callCount(1);
      testObj.serverRepository.getByIpAddress.should.have.calledWith(
        sinon.match(`${inputModel.ip}/${inputModel.mask}`),
      );
      testObj.proxyServerService.add.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(JobModel);
    });

    test(`Should successful add in current instance when found server but should stay in current server`, async () => {
      const inputModel = new IpAddressModel();
      inputModel.ip = '192.168.1.0';
      inputModel.mask = 29;
      inputModel.gateway = '192.168.1.6';
      inputModel.interface = 'ens192';
      const outputServerModel = new ServerModel();
      outputServerModel.name = 'server-1';
      outputServerModel.ipRange = ['192.168.1.0/29'];
      outputServerModel.hostIpAddress = '10.10.10.1';
      outputServerModel.hostApiPort = 8080;
      outputServerModel.isEnable = true;
      testObj.serverRepository.getByIpAddress.resolves([null, outputServerModel]);
      const outputJobModel = new JobModel();
      outputJobModel.id = testObj.identifierGenerator.generateId();
      testObj.proxyServerService.add.resolves([null, outputJobModel]);

      const [error, result] = await testObj.findClusterProxyServerService.add(inputModel);

      testObj.serverRepository.getByIpAddress.should.have.callCount(1);
      testObj.serverRepository.getByIpAddress.should.have.calledWith(
        sinon.match(`${inputModel.ip}/${inputModel.mask}`),
      );
      testObj.proxyServerService.add.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(JobModel);
    });

    test(`Should successful add in current instance when found server with use NAT ip but should stay in current server`, async () => {
      const inputModel = new IpAddressModel();
      inputModel.ip = '192.168.1.0';
      inputModel.mask = 29;
      inputModel.gateway = '192.168.1.6';
      inputModel.interface = 'ens192';
      const outputServerModel = new ServerModel();
      outputServerModel.name = 'server-1';
      outputServerModel.ipRange = ['192.168.1.0/29'];
      outputServerModel.hostIpAddress = '123.40.52.6';
      outputServerModel.internalHostIpAddress = '10.10.10.1';
      outputServerModel.hostApiPort = 8080;
      outputServerModel.isEnable = true;
      testObj.serverRepository.getByIpAddress.resolves([null, outputServerModel]);
      testObj.networkInterfaces.returns({ ens192: [{ address: '10.10.10.1' }] });
      const outputJobModel = new JobModel();
      outputJobModel.id = testObj.identifierGenerator.generateId();
      testObj.proxyServerService.add.resolves([null, outputJobModel]);

      const [error, result] = await testObj.findClusterProxyServerService.add(inputModel);

      testObj.serverRepository.getByIpAddress.should.have.callCount(1);
      testObj.serverRepository.getByIpAddress.should.have.calledWith(
        sinon.match(`${inputModel.ip}/${inputModel.mask}`),
      );
      testObj.proxyServerService.add.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(JobModel);
    });

    test(`Should error add in other instance`, async () => {
      const inputModel = new IpAddressModel();
      inputModel.ip = '192.168.1.0';
      inputModel.mask = 29;
      inputModel.gateway = '192.168.1.6';
      inputModel.interface = 'ens192';
      const outputServerModel = new ServerModel();
      outputServerModel.name = 'server-1';
      outputServerModel.ipRange = ['192.168.1.0/29'];
      outputServerModel.hostIpAddress = '123.40.52.6';
      outputServerModel.hostApiPort = 8080;
      outputServerModel.isEnable = true;
      testObj.serverRepository.getByIpAddress.resolves([null, outputServerModel]);
      testObj.networkInterfaces.returns({ ens192: [{ address: '10.10.10.1' }] });
      const outputJobModel = new JobModel();
      outputJobModel.id = testObj.identifierGenerator.generateId();
      testObj.proxyServerApiRepository.generateIp.resolves([new UnknownException()]);

      const [error] = await testObj.otherFindClusterProxyServerService.add(inputModel);

      testObj.serverRepository.getByIpAddress.should.have.callCount(1);
      testObj.serverRepository.getByIpAddress.should.have.calledWith(
        sinon.match(`${inputModel.ip}/${inputModel.mask}`),
      );
      testObj.proxyServerApiRepository.generateIp.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful add in other instance`, async () => {
      const inputModel = new IpAddressModel();
      inputModel.ip = '192.168.1.0';
      inputModel.mask = 29;
      inputModel.gateway = '192.168.1.6';
      inputModel.interface = 'ens192';
      const outputServerModel = new ServerModel();
      outputServerModel.name = 'server-1';
      outputServerModel.ipRange = ['192.168.1.0/29'];
      outputServerModel.hostIpAddress = '123.40.52.6';
      outputServerModel.hostApiPort = 8080;
      outputServerModel.isEnable = true;
      testObj.serverRepository.getByIpAddress.resolves([null, outputServerModel]);
      testObj.networkInterfaces.returns({ ens192: [{ address: '10.10.10.1' }] });
      const outputJobModel = new JobModel();
      outputJobModel.id = testObj.identifierGenerator.generateId();
      testObj.proxyServerApiRepository.generateIp.resolves([null, outputJobModel]);

      const [error, result] = await testObj.otherFindClusterProxyServerService.add(inputModel);

      testObj.serverRepository.getByIpAddress.should.have.callCount(1);
      testObj.serverRepository.getByIpAddress.should.have.calledWith(
        sinon.match(`${inputModel.ip}/${inputModel.mask}`),
      );
      testObj.proxyServerApiRepository.generateIp.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(JobModel);
    });
  });

  suite(`Reload all proxy`, () => {
    test(`Should error reload all proxy`, async () => {
      testObj.proxyServerService.reload.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterProxyServerService.reload();

      testObj.proxyServerService.reload.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully reload all proxy`, async () => {
      testObj.proxyServerService.reload.resolves([null]);

      const [error] = await testObj.findClusterProxyServerService.reload();

      testObj.proxyServerService.reload.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });

  suite(`Delete ip list of proxy`, () => {
    test(`Should error delete when find ip mask in server ipRange`, async () => {
      const inputModel = new IpAddressModel();
      inputModel.ip = '192.168.1.0';
      inputModel.mask = 29;
      inputModel.gateway = '192.168.1.6';
      inputModel.interface = 'ens192';
      testObj.serverRepository.getByIpAddress.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterProxyServerService.delete(inputModel);

      testObj.serverRepository.getByIpAddress.should.have.callCount(1);
      testObj.serverRepository.getByIpAddress.should.have.calledWith(
        sinon.match(`${inputModel.ip}/${inputModel.mask}`),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error delete when not found any server and execute in current instance`, async () => {
      const inputModel = new IpAddressModel();
      inputModel.ip = '192.168.1.0';
      inputModel.mask = 29;
      inputModel.gateway = '192.168.1.6';
      inputModel.interface = 'ens192';
      testObj.serverRepository.getByIpAddress.resolves([null, null]);
      testObj.proxyServerService.delete.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterProxyServerService.delete(inputModel);

      testObj.serverRepository.getByIpAddress.should.have.callCount(1);
      testObj.serverRepository.getByIpAddress.should.have.calledWith(
        sinon.match(`${inputModel.ip}/${inputModel.mask}`),
      );
      testObj.proxyServerService.delete.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful delete in current instance when not found any server`, async () => {
      const inputModel = new IpAddressModel();
      inputModel.ip = '192.168.1.0';
      inputModel.mask = 29;
      inputModel.gateway = '192.168.1.6';
      inputModel.interface = 'ens192';
      testObj.serverRepository.getByIpAddress.resolves([null, null]);
      const outputJobModel = new JobModel();
      outputJobModel.id = testObj.identifierGenerator.generateId();
      testObj.proxyServerService.delete.resolves([null, outputJobModel]);

      const [error, result] = await testObj.findClusterProxyServerService.delete(inputModel);

      testObj.serverRepository.getByIpAddress.should.have.callCount(1);
      testObj.serverRepository.getByIpAddress.should.have.calledWith(
        sinon.match(`${inputModel.ip}/${inputModel.mask}`),
      );
      testObj.proxyServerService.delete.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(JobModel);
    });

    test(`Should successful delete in current instance when found server but should stay in current server`, async () => {
      const inputModel = new IpAddressModel();
      inputModel.ip = '192.168.1.0';
      inputModel.mask = 29;
      inputModel.gateway = '192.168.1.6';
      inputModel.interface = 'ens192';
      const outputServerModel = new ServerModel();
      outputServerModel.name = 'server-1';
      outputServerModel.ipRange = ['192.168.1.0/29'];
      outputServerModel.hostIpAddress = '10.10.10.1';
      outputServerModel.hostApiPort = 8080;
      outputServerModel.isEnable = true;
      testObj.serverRepository.getByIpAddress.resolves([null, outputServerModel]);
      const outputJobModel = new JobModel();
      outputJobModel.id = testObj.identifierGenerator.generateId();
      testObj.proxyServerService.delete.resolves([null, outputJobModel]);

      const [error, result] = await testObj.findClusterProxyServerService.delete(inputModel);

      testObj.serverRepository.getByIpAddress.should.have.callCount(1);
      testObj.serverRepository.getByIpAddress.should.have.calledWith(
        sinon.match(`${inputModel.ip}/${inputModel.mask}`),
      );
      testObj.proxyServerService.delete.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(JobModel);
    });

    test(`Should successful delete in current instance when found server with use NAT ip but should stay in current server`, async () => {
      const inputModel = new IpAddressModel();
      inputModel.ip = '192.168.1.0';
      inputModel.mask = 29;
      inputModel.gateway = '192.168.1.6';
      inputModel.interface = 'ens192';
      const outputServerModel = new ServerModel();
      outputServerModel.name = 'server-1';
      outputServerModel.ipRange = ['192.168.1.0/29'];
      outputServerModel.hostIpAddress = '123.40.52.6';
      outputServerModel.internalHostIpAddress = '10.10.10.1';
      outputServerModel.hostApiPort = 8080;
      outputServerModel.isEnable = true;
      testObj.serverRepository.getByIpAddress.resolves([null, outputServerModel]);
      testObj.networkInterfaces.returns({ ens192: [{ address: '10.10.10.1' }] });
      const outputJobModel = new JobModel();
      outputJobModel.id = testObj.identifierGenerator.generateId();
      testObj.proxyServerService.delete.resolves([null, outputJobModel]);

      const [error, result] = await testObj.findClusterProxyServerService.delete(inputModel);

      testObj.serverRepository.getByIpAddress.should.have.callCount(1);
      testObj.serverRepository.getByIpAddress.should.have.calledWith(
        sinon.match(`${inputModel.ip}/${inputModel.mask}`),
      );
      testObj.proxyServerService.delete.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(JobModel);
    });

    test(`Should error delete in other instance`, async () => {
      const inputModel = new IpAddressModel();
      inputModel.ip = '192.168.1.0';
      inputModel.mask = 29;
      inputModel.gateway = '192.168.1.6';
      inputModel.interface = 'ens192';
      const outputServerModel = new ServerModel();
      outputServerModel.name = 'server-1';
      outputServerModel.ipRange = ['192.168.1.0/29'];
      outputServerModel.hostIpAddress = '123.40.52.6';
      outputServerModel.hostApiPort = 8080;
      outputServerModel.isEnable = true;
      testObj.serverRepository.getByIpAddress.resolves([null, outputServerModel]);
      testObj.networkInterfaces.returns({ ens192: [{ address: '10.10.10.1' }] });
      const outputJobModel = new JobModel();
      outputJobModel.id = testObj.identifierGenerator.generateId();
      testObj.proxyServerApiRepository.deleteIp.resolves([new UnknownException()]);

      const [error] = await testObj.otherFindClusterProxyServerService.delete(inputModel);

      testObj.serverRepository.getByIpAddress.should.have.callCount(1);
      testObj.serverRepository.getByIpAddress.should.have.calledWith(
        sinon.match(`${inputModel.ip}/${inputModel.mask}`),
      );
      testObj.proxyServerApiRepository.deleteIp.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful delete in other instance`, async () => {
      const inputModel = new IpAddressModel();
      inputModel.ip = '192.168.1.0';
      inputModel.mask = 29;
      inputModel.gateway = '192.168.1.6';
      inputModel.interface = 'ens192';
      const outputServerModel = new ServerModel();
      outputServerModel.name = 'server-1';
      outputServerModel.ipRange = ['192.168.1.0/29'];
      outputServerModel.hostIpAddress = '123.40.52.6';
      outputServerModel.hostApiPort = 8080;
      outputServerModel.isEnable = true;
      testObj.serverRepository.getByIpAddress.resolves([null, outputServerModel]);
      testObj.networkInterfaces.returns({ ens192: [{ address: '10.10.10.1' }] });
      const outputJobModel = new JobModel();
      outputJobModel.id = testObj.identifierGenerator.generateId();
      testObj.proxyServerApiRepository.deleteIp.resolves([null, outputJobModel]);

      const [error, result] = await testObj.otherFindClusterProxyServerService.delete(inputModel);

      testObj.serverRepository.getByIpAddress.should.have.callCount(1);
      testObj.serverRepository.getByIpAddress.should.have.calledWith(
        sinon.match(`${inputModel.ip}/${inputModel.mask}`),
      );
      testObj.proxyServerApiRepository.deleteIp.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(JobModel);
    });
  });
});
