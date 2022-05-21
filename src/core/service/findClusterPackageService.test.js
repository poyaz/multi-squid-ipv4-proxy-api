/**
 * Created by pooya on 2/16/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const ServerModel = require('~src/core/model/serverModel');
const PackageModel = require('~src/core/model/packageModel');
const UnknownException = require('~src/core/exception/unknownException');
const SyncPackageProxyException = require('~src/core/exception/syncPackageProxyException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`FindClusterPackageService`, () => {
  setup(() => {
    const {
      packageService,
      serverService,
      serverApiRepository,
      findClusterPackageService,
    } = helper.fakeFindClusterPackageService('10.10.10.4');

    testObj.packageService = packageService;
    testObj.serverService = serverService;
    testObj.serverApiRepository = serverApiRepository;
    testObj.findClusterPackageService = findClusterPackageService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
  });

  suite(`Get by id`, () => {
    setup(() => {
      const outputFetchModel = new PackageModel();
      outputFetchModel.id = testObj.identifierGenerator.generateId();
      outputFetchModel.userId = testObj.identifierGenerator.generateId();
      outputFetchModel.username = 'user1';
      outputFetchModel.countIp = 3;
      outputFetchModel.ipList = [
        { ip: '192.168.1.2', port: 8080 },
        { ip: '192.168.1.3', port: 8080 },
        { ip: '192.168.1.4', port: 8080 },
      ];
      outputFetchModel.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

      testObj.outputFetchModel = outputFetchModel;
    });

    test(`Should error get package by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.packageService.getById.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.getById(inputId);

      testObj.packageService.getById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully get package by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputFetchModel = testObj.outputFetchModel;
      testObj.packageService.getById.resolves([null, outputFetchModel]);

      const [error, result] = await testObj.findClusterPackageService.getById(inputId);

      testObj.packageService.getById.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(PackageModel);
      expect(result.countIp).to.be.equal(3);
    });
  });

  suite(`Get all package by username`, () => {
    test(`Should error get all package when get all instance has fail`, async () => {
      const inputUsername = 'user1';
      const inputFilterModel = new PackageModel();
      testObj.serverService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.getAllByUsername(
        inputUsername,
        inputFilterModel,
      );

      testObj.serverService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error get all package in current instance because not found any server`, async () => {
      const inputUsername = 'user1';
      const inputFilterModel = new PackageModel();
      testObj.serverService.getAll.resolves([null, []]);
      testObj.packageService.getAllByUsername.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.getAllByUsername(
        inputUsername,
        inputFilterModel,
      );

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.getAllByUsername.should.have.callCount(1);
      testObj.packageService.getAllByUsername.should.have.calledWith(
        sinon.match(inputUsername),
        sinon.match.instanceOf(PackageModel),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful get all package in current instance because not found any server`, async () => {
      const inputUsername = 'user1';
      const inputFilterModel = new PackageModel();
      testObj.serverService.getAll.resolves([null, []]);
      testObj.packageService.getAllByUsername.resolves([null, []]);

      const [error, result] = await testObj.findClusterPackageService.getAllByUsername(
        inputUsername,
        inputFilterModel,
      );

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.getAllByUsername.should.have.callCount(1);
      testObj.packageService.getAllByUsername.should.have.calledWith(
        sinon.match(inputUsername),
        sinon.match.instanceOf(PackageModel),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should error get all package in all instance when send request has been fail`, async () => {
      const inputUsername = 'user1';
      const inputFilterModel = new PackageModel();
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
      testObj.serverApiRepository.getAllPackageByUsername
        .onCall(0)
        .resolves([null, new PackageModel()])
        .onCall(1)
        .resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.getAllByUsername(
        inputUsername,
        inputFilterModel,
      );

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.serverApiRepository.getAllPackageByUsername.should.have.callCount(2);
      testObj.serverApiRepository.getAllPackageByUsername.should.have.calledWith(
        sinon.match(inputUsername),
        sinon.match.instanceOf(PackageModel),
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful get all package in all instance`, async () => {
      const inputUsername = 'user1';
      const inputFilterModel = new PackageModel();
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
      const outputPackageModel1 = new PackageModel();
      outputPackageModel1.id = testObj.identifierGenerator.generateId();
      outputPackageModel1.userId = testObj.identifierGenerator.generateId();
      outputPackageModel1.username = 'user1';
      outputPackageModel1.countIp = 3;
      outputPackageModel1.ipList = [
        { ip: '192.168.1.2', port: 8080 },
        { ip: '192.168.1.3', port: 8080 },
        { ip: '192.168.1.4', port: 8080 },
      ];
      outputPackageModel1.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      const outputPackageModel2 = new PackageModel();
      outputPackageModel2.id = testObj.identifierGenerator.generateId();
      outputPackageModel2.userId = testObj.identifierGenerator.generateId();
      outputPackageModel2.username = 'user1';
      outputPackageModel2.countIp = 3;
      outputPackageModel2.ipList = [
        { ip: '192.168.1.2', port: 8080 },
        { ip: '192.168.1.5', port: 8080 },
        { ip: '192.168.1.6', port: 8080 },
      ];
      outputPackageModel2.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      testObj.serverApiRepository.getAllPackageByUsername
        .onCall(0)
        .resolves([null, [outputPackageModel1]])
        .onCall(1)
        .resolves([null, [outputPackageModel2]]);

      const [error, result] = await testObj.findClusterPackageService.getAllByUsername(
        inputUsername,
        inputFilterModel,
      );

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.serverApiRepository.getAllPackageByUsername.should.have.callCount(2);
      testObj.serverApiRepository.getAllPackageByUsername.should.have.calledWith(
        sinon.match(inputUsername),
        sinon.match.instanceOf(PackageModel),
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.an.instanceof(PackageModel);
      expect(result[0].countIp).to.be.equal(5);
      expect(result[0].ipList[0]).to.have.include({ ip: '192.168.1.2', port: 8080 });
      expect(result[0].ipList[1]).to.have.include({ ip: '192.168.1.3', port: 8080 });
      expect(result[0].ipList[2]).to.have.include({ ip: '192.168.1.4', port: 8080 });
      expect(result[0].ipList[3]).to.have.include({ ip: '192.168.1.5', port: 8080 });
      expect(result[0].ipList[4]).to.have.include({ ip: '192.168.1.6', port: 8080 });
    });
  });

  suite(`Check ip exist for create package for user`, () => {
    test(`Should error check ip exist for create package for user when execute`, async () => {
      const inputModel = new PackageModel();
      inputModel.userId = testObj.identifierGenerator.generateId();
      inputModel.countIp = 4;
      inputModel.proxyType = 'dc';
      inputModel.country = 'GB';
      testObj.packageService.checkIpExistForCreatePackage.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.checkIpExistForCreatePackage(
        inputModel,
      );

      testObj.packageService.checkIpExistForCreatePackage.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully check ip exist for create package for user`, async () => {
      const inputModel = new PackageModel();
      inputModel.userId = testObj.identifierGenerator.generateId();
      inputModel.countIp = 4;
      inputModel.proxyType = 'dc';
      inputModel.country = 'GB';
      testObj.packageService.checkIpExistForCreatePackage.resolves([null]);

      const [error] = await testObj.findClusterPackageService.checkIpExistForCreatePackage(
        inputModel,
      );

      testObj.packageService.checkIpExistForCreatePackage.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });

  suite(`Add new package`, () => {
    test(`Should error add new package when get all instance has fail`, async () => {
      const inputModel = new PackageModel();
      inputModel.username = 'user1';
      inputModel.countIp = 1;
      inputModel.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      testObj.serverService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.add(inputModel);

      testObj.serverService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error add new package in current instance because not found any server`, async () => {
      const inputModel = new PackageModel();
      inputModel.username = 'user1';
      inputModel.countIp = 1;
      inputModel.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      testObj.serverService.getAll.resolves([null, []]);
      testObj.packageService.add.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.add(inputModel);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.add.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful add new package in current instance because not found any server`, async () => {
      const inputModel = new PackageModel();
      inputModel.username = 'user1';
      inputModel.countIp = 1;
      inputModel.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      testObj.serverService.getAll.resolves([null, []]);
      const outputAddPackage = new PackageModel();
      outputAddPackage.username = 'user1';
      outputAddPackage.countIp = 1;
      outputAddPackage.ipList = [{ ip: '192.168.1.3', port: 8080 }];
      outputAddPackage.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      outputAddPackage.insertDate = new Date();
      testObj.packageService.add.resolves([null, outputAddPackage]);

      const [error, result] = await testObj.findClusterPackageService.add(inputModel);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.add.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceOf(PackageModel);
    });

    test(`Should error add new package in all instance when send request has been fail in all server`, async () => {
      const inputModel = new PackageModel();
      inputModel.username = 'user1';
      inputModel.countIp = 1;
      inputModel.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
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
      const outputAddPackage = new PackageModel();
      outputAddPackage.id = testObj.identifierGenerator.generateId();
      outputAddPackage.username = 'user1';
      outputAddPackage.countIp = 1;
      outputAddPackage.ipList = [{ ip: '192.168.1.3', port: 8080 }];
      outputAddPackage.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      outputAddPackage.insertDate = new Date();
      testObj.packageService.add.resolves([null, outputAddPackage]);
      testObj.serverApiRepository.syncPackageById.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.add(inputModel);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.add.should.have.callCount(1);
      testObj.serverApiRepository.syncPackageById.should.have.callCount(2);
      testObj.serverApiRepository.syncPackageById.should.have.calledWith(
        sinon.match(outputAddPackage.id),
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.an.instanceof(SyncPackageProxyException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful add new package in all instance when send request has been fail in at least one server`, async () => {
      const inputModel = new PackageModel();
      inputModel.username = 'user1';
      inputModel.countIp = 1;
      inputModel.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
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
      const outputAddPackage = new PackageModel();
      outputAddPackage.id = testObj.identifierGenerator.generateId();
      outputAddPackage.username = 'user1';
      outputAddPackage.countIp = 1;
      outputAddPackage.ipList = [{ ip: '192.168.1.3', port: 8080 }];
      outputAddPackage.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      outputAddPackage.insertDate = new Date();
      testObj.packageService.add.resolves([null, outputAddPackage]);
      testObj.serverApiRepository.syncPackageById
        .onCall(0)
        .resolves([null])
        .onCall(1)
        .resolves([new UnknownException()])
        .onCall(2)
        .resolves([null]);

      const [error, result] = await testObj.findClusterPackageService.add(inputModel);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.add.should.have.callCount(1);
      testObj.serverApiRepository.syncPackageById.should.have.callCount(2);
      testObj.serverApiRepository.syncPackageById.should.have.calledWith(
        sinon.match(outputAddPackage.id),
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceOf(PackageModel);
    });

    test(`Should successful add new package in all instance`, async () => {
      const inputModel = new PackageModel();
      inputModel.username = 'user1';
      inputModel.countIp = 1;
      inputModel.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
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
      const outputAddPackage = new PackageModel();
      outputAddPackage.id = testObj.identifierGenerator.generateId();
      outputAddPackage.username = 'user1';
      outputAddPackage.countIp = 1;
      outputAddPackage.ipList = [{ ip: '192.168.1.3', port: 8080 }];
      outputAddPackage.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      outputAddPackage.insertDate = new Date();
      testObj.packageService.add.resolves([null, outputAddPackage]);
      testObj.serverApiRepository.syncPackageById.resolves([null]);

      const [error, result] = await testObj.findClusterPackageService.add(inputModel);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.add.should.have.callCount(1);
      testObj.serverApiRepository.syncPackageById.should.have.callCount(2);
      testObj.serverApiRepository.syncPackageById.should.have.calledWith(
        sinon.match(outputAddPackage.id),
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceOf(PackageModel);
    });
  });

  suite(`Renew expire date`, () => {
    test(`Should error renew expire package`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const inputExpireDate = new Date();
      const outputFetchModel = new PackageModel();
      outputFetchModel.expireDate = new Date(new Date().getTime() + 60000);
      testObj.packageService.renew.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.renew(inputId, inputExpireDate);

      testObj.packageService.renew.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful renew expire package`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const inputExpireDate = new Date();
      const outputFetchModel = new PackageModel();
      outputFetchModel.expireDate = new Date(new Date().getTime() + 60000);
      testObj.packageService.renew.resolves([null]);

      const [error] = await testObj.findClusterPackageService.renew(inputId, inputExpireDate);

      testObj.packageService.renew.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });

  suite(`Renewal expire date`, () => {
    test(`Should error renewal package`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const inputRenewalDate = new Date();
      const outputFetchModel = new PackageModel();
      outputFetchModel.expireDate = new Date(new Date().getTime() + 60000);
      testObj.packageService.renewal.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.renewal(inputId, inputRenewalDate);

      testObj.packageService.renewal.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful renewal package`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const inputRenewalDate = new Date();
      const outputFetchModel = new PackageModel();
      outputFetchModel.expireDate = new Date(new Date().getTime() + 60000);
      testObj.packageService.renewal.resolves([null]);

      const [error] = await testObj.findClusterPackageService.renewal(inputId, inputRenewalDate);

      testObj.packageService.renewal.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });

  suite(`Cancel package`, () => {
    test(`Should error cancel package when get all instance has fail`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.serverService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.cancel(inputId);

      testObj.serverService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error cancel package in current instance because not found any server`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.serverService.getAll.resolves([null, []]);
      testObj.packageService.cancel.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.cancel(inputId);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.cancel.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful cancel package in current instance because not found any server`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.serverService.getAll.resolves([null, []]);
      testObj.packageService.cancel.resolves([null]);

      const [error] = await testObj.findClusterPackageService.cancel(inputId);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.cancel.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should error cancel package in all instance when send request has been fail in all server or at least one server`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
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
      const outputAddPackage = new PackageModel();
      outputAddPackage.id = testObj.identifierGenerator.generateId();
      outputAddPackage.username = 'user1';
      outputAddPackage.countIp = 1;
      outputAddPackage.ipList = [{ ip: '192.168.1.3', port: 8080 }];
      outputAddPackage.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      outputAddPackage.insertDate = new Date();
      testObj.packageService.cancel.resolves([null, outputAddPackage]);
      testObj.serverApiRepository.syncPackageById.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.cancel(inputId);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.cancel.should.have.callCount(1);
      testObj.serverApiRepository.syncPackageById.should.have.callCount(2);
      testObj.serverApiRepository.syncPackageById.should.have.calledWith(
        sinon.match(outputAddPackage.id),
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.an.instanceof(SyncPackageProxyException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful cancel package in all instance`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
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
      const outputAddPackage = new PackageModel();
      outputAddPackage.id = testObj.identifierGenerator.generateId();
      outputAddPackage.username = 'user1';
      outputAddPackage.countIp = 1;
      outputAddPackage.ipList = [{ ip: '192.168.1.3', port: 8080 }];
      outputAddPackage.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      outputAddPackage.insertDate = new Date();
      testObj.packageService.cancel.resolves([null, outputAddPackage]);
      testObj.serverApiRepository.syncPackageById.resolves([null]);

      const [error] = await testObj.findClusterPackageService.cancel(inputId);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.cancel.should.have.callCount(1);
      testObj.serverApiRepository.syncPackageById.should.have.callCount(2);
      testObj.serverApiRepository.syncPackageById.should.have.calledWith(
        sinon.match(outputAddPackage.id),
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.a('null');
    });
  });

  suite(`Disable expire package`, () => {
    test(`Should error disable expire package when get all instance has fail`, async () => {
      testObj.serverService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.disableExpirePackage();

      testObj.serverService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error disable expire package in current instance because not found any server`, async () => {
      testObj.serverService.getAll.resolves([null, []]);
      testObj.packageService.disableExpirePackage.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.disableExpirePackage();

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.disableExpirePackage.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful disable expire package in current instance because not found any server`, async () => {
      testObj.serverService.getAll.resolves([null, []]);
      testObj.packageService.disableExpirePackage.resolves([null, []]);

      const [error, result] = await testObj.findClusterPackageService.disableExpirePackage();

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.disableExpirePackage.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should successful disable expire package and don't execute in other server because no expire package record exist`, async () => {
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
      const outputDisablePackage = new PackageModel();
      outputDisablePackage.id = testObj.identifierGenerator.generateId();
      outputDisablePackage.username = 'user1';
      outputDisablePackage.countIp = 1;
      outputDisablePackage.ipList = [{ ip: '192.168.1.3', port: 8080 }];
      outputDisablePackage.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      outputDisablePackage.insertDate = new Date();
      testObj.packageService.disableExpirePackage.resolves([null, []]);

      const [error, result] = await testObj.findClusterPackageService.disableExpirePackage();

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.disableExpirePackage.should.have.callCount(1);
      testObj.serverApiRepository.syncPackageById.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should error disable expire package in all instance when send request has been fail in all server or at least one server`, async () => {
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
      const outputDisablePackage = new PackageModel();
      outputDisablePackage.id = testObj.identifierGenerator.generateId();
      outputDisablePackage.username = 'user1';
      outputDisablePackage.countIp = 1;
      outputDisablePackage.ipList = [{ ip: '192.168.1.3', port: 8080 }];
      outputDisablePackage.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      outputDisablePackage.insertDate = new Date();
      testObj.packageService.disableExpirePackage.resolves([null, [outputDisablePackage]]);
      testObj.serverApiRepository.syncPackageById.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.disableExpirePackage();

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.disableExpirePackage.should.have.callCount(1);
      testObj.serverApiRepository.syncPackageById.should.have.callCount(2);
      testObj.serverApiRepository.syncPackageById.should.have.calledWith(
        sinon.match(outputDisablePackage.id),
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.an.instanceof(SyncPackageProxyException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful disable expire package in all instance`, async () => {
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
      const outputDisablePackage1 = new PackageModel();
      outputDisablePackage1.id = testObj.identifierGenerator.generateId();
      outputDisablePackage1.username = 'user1';
      outputDisablePackage1.countIp = 1;
      outputDisablePackage1.ipList = [{ ip: '192.168.1.3', port: 8080 }];
      outputDisablePackage1.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      outputDisablePackage1.insertDate = new Date();
      testObj.packageService.disableExpirePackage.resolves([null, [outputDisablePackage1]]);
      testObj.serverApiRepository.syncPackageById.resolves([null]);

      const [error, result] = await testObj.findClusterPackageService.disableExpirePackage();

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.disableExpirePackage.should.have.callCount(1);
      testObj.serverApiRepository.syncPackageById.should.have.callCount(2);
      testObj.serverApiRepository.syncPackageById.should.have.calledWith(
        sinon.match(outputDisablePackage1.id),
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
    });
  });

  suite(`Remove package`, () => {
    test(`Should error remove package when get all instance has fail`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.serverService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.remove(inputId);

      testObj.serverService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error remove package in current instance because not found any server`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.serverService.getAll.resolves([null, []]);
      testObj.packageService.remove.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.remove(inputId);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.remove.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful remove package in current instance because not found any server`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.serverService.getAll.resolves([null, []]);
      testObj.packageService.remove.resolves([null]);

      const [error] = await testObj.findClusterPackageService.remove(inputId);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.remove.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should error remove package in all instance when send request has been fail in all server or at least one server`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
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
      const outputAddPackage = new PackageModel();
      outputAddPackage.id = testObj.identifierGenerator.generateId();
      outputAddPackage.username = 'user1';
      outputAddPackage.countIp = 1;
      outputAddPackage.ipList = [{ ip: '192.168.1.3', port: 8080 }];
      outputAddPackage.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      outputAddPackage.insertDate = new Date();
      testObj.packageService.remove.resolves([null, outputAddPackage]);
      testObj.serverApiRepository.syncPackageById.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.remove(inputId);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.remove.should.have.callCount(1);
      testObj.serverApiRepository.syncPackageById.should.have.callCount(2);
      testObj.serverApiRepository.syncPackageById.should.have.calledWith(
        sinon.match(outputAddPackage.id),
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.an.instanceof(SyncPackageProxyException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful remove package in all instance`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
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
      const outputAddPackage = new PackageModel();
      outputAddPackage.id = testObj.identifierGenerator.generateId();
      outputAddPackage.username = 'user1';
      outputAddPackage.countIp = 1;
      outputAddPackage.ipList = [{ ip: '192.168.1.3', port: 8080 }];
      outputAddPackage.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      outputAddPackage.insertDate = new Date();
      testObj.packageService.remove.resolves([null, outputAddPackage]);
      testObj.serverApiRepository.syncPackageById.resolves([null]);

      const [error] = await testObj.findClusterPackageService.remove(inputId);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.packageService.remove.should.have.callCount(1);
      testObj.serverApiRepository.syncPackageById.should.have.callCount(2);
      testObj.serverApiRepository.syncPackageById.should.have.calledWith(
        sinon.match(outputAddPackage.id),
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.a('null');
    });
  });

  suite(`Sync package with id`, () => {
    test(`Should error sync package`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.packageService.syncPackageById.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterPackageService.syncPackageById(inputId);

      testObj.packageService.syncPackageById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful sync package`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.packageService.syncPackageById.resolves([null]);

      const [error] = await testObj.findClusterPackageService.syncPackageById(inputId);

      testObj.packageService.syncPackageById.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });
});
