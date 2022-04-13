/**
 * Created by pooya on 8/25/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const { createRequest, createResponse } = require('node-mocks-http');

const helper = require('~src/helper');

const PackageModel = require('~src/core/model/packageModel');
const UnknownException = require('~src/core/exception/unknownException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
chai.use(chaiAsPromised);

const expect = chai.expect;
const testObj = {};

suite(`PackageController`, () => {
  setup(() => {
    testObj.req = new createRequest();
    testObj.res = new createResponse();

    const {
      packageService,
      findClusterPackageService,
      packageController,
    } = helper.fakePackageController(testObj.req, testObj.res);

    testObj.packageService = packageService;
    testObj.findClusterPackageService = findClusterPackageService;
    testObj.packageController = packageController;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.dateRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/;
    testObj.expireRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
  });

  suite(`Create new package`, () => {
    test(`Should error create new package`, async () => {
      testObj.req.body = {
        username: 'user1',
        countIp: 1,
        expire: '2021-08-25',
        type: 'isp',
        country: 'GB',
      };
      testObj.findClusterPackageService.add.resolves([new UnknownException()]);

      const [error] = await testObj.packageController.addPackage();

      testObj.findClusterPackageService.add.should.have.callCount(1);
      testObj.findClusterPackageService.add.should.have.calledWith(
        sinon.match.instanceOf(PackageModel),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully create new package`, async () => {
      testObj.req.body = {
        username: 'user1',
        countIp: 1,
        expire: '2021-08-25',
        type: 'isp',
        country: 'GB',
      };
      const outputModel = new PackageModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.userId = testObj.identifierGenerator.generateId();
      outputModel.username = 'user1';
      outputModel.password = 'pass1';
      outputModel.countIp = 1;
      outputModel.type = 'isp';
      outputModel.country = 'GB';
      outputModel.ipList = [{ ip: '192.168.1.2', port: 8080 }];
      outputModel.isEnable = true;
      outputModel.insertDate = new Date();
      outputModel.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      testObj.findClusterPackageService.add.resolves([null, outputModel]);

      const [error, result] = await testObj.packageController.addPackage();

      testObj.findClusterPackageService.add.should.have.callCount(1);
      testObj.findClusterPackageService.add.should.have.calledWith(
        sinon.match.instanceOf(PackageModel),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.a('object');
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator.generateId(),
        username: testObj.req.body.username,
        password: 'pass1',
        countIp: 1,
        type: 'isp',
        country: 'GB',
        isEnable: true,
      });
      expect(result.ipList[0]).to.have.include({
        ip: '192.168.1.2',
        port: 8080,
      });
      expect(result.insertDate).to.have.match(testObj.dateRegex);
      expect(result.expireDate).to.have.match(testObj.expireRegex);
    });
  });

  suite(`Get all package by username`, () => {
    test(`Should error get all package with username`, async () => {
      testObj.req.params = { username: 'user1' };
      testObj.findClusterPackageService.getAllByUsername.resolves([new UnknownException()]);

      const [error] = await testObj.packageController.getAllByUsername();

      testObj.findClusterPackageService.getAllByUsername.should.have.callCount(1);
      testObj.findClusterPackageService.getAllByUsername.should.have.calledWith(
        sinon.match(testObj.req.params.username),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully get all package with username`, async () => {
      testObj.req.params = { username: 'user1' };
      const outputModel1 = new PackageModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.userId = testObj.identifierGenerator.generateId();
      outputModel1.username = 'user1';
      outputModel1.password = 'pass1';
      outputModel1.countIp = 2;
      outputModel1.type = 'isp';
      outputModel1.country = 'GB';
      outputModel1.ipList = [
        { ip: '192.168.1.2', port: 8080 },
        { ip: '192.168.1.3', port: 8080 },
      ];
      outputModel1.isEnable = true;
      outputModel1.expireDate = new Date();
      outputModel1.insertDate = new Date();
      const outputModel2 = new PackageModel();
      outputModel2.id = testObj.identifierGenerator.generateId();
      outputModel2.userId = testObj.identifierGenerator.generateId();
      outputModel2.username = 'user1';
      outputModel2.password = 'pass1';
      outputModel2.countIp = 1;
      outputModel2.type = 'isp';
      outputModel2.country = 'GB';
      outputModel2.ipList = [{ ip: '192.168.1.4', port: 8080 }];
      outputModel2.isEnable = true;
      outputModel2.expireDate = new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000);
      outputModel2.insertDate = new Date();
      testObj.findClusterPackageService.getAllByUsername.resolves([
        null,
        [outputModel1, outputModel2],
      ]);

      const [error, result] = await testObj.packageController.getAllByUsername();

      testObj.findClusterPackageService.getAllByUsername.should.have.callCount(1);
      testObj.findClusterPackageService.getAllByUsername.should.have.calledWith(
        sinon.match(testObj.req.params.username),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.length(2);
      expect(result[0]).to.be.a('object');
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator.generateId(),
        username: 'user1',
        password: 'pass1',
        countIp: 2,
        type: 'isp',
        country: 'GB',
        isEnable: true,
      });
      expect(result[0].ipList[0]).to.have.include({
        ip: '192.168.1.2',
        port: 8080,
      });
      expect(result[0].ipList[1]).to.have.include({
        ip: '192.168.1.3',
        port: 8080,
      });
      expect(result[0].insertDate).to.have.match(testObj.dateRegex);
      expect(result[0].expireDate).to.have.match(testObj.expireRegex);
      expect(result[1]).to.be.a('object');
      expect(result[1]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator.generateId(),
        username: 'user1',
        password: 'pass1',
        countIp: 1,
        type: 'isp',
        country: 'GB',
        isEnable: true,
      });
      expect(result[1].ipList[0]).to.have.include({
        ip: '192.168.1.4',
        port: 8080,
      });
      expect(result[1].insertDate).to.have.match(testObj.dateRegex);
      expect(result[1].expireDate).to.have.match(testObj.expireRegex);
    });
  });

  suite(`Get all package by username in self instance`, () => {
    test(`Should error get all package with username in self instance`, async () => {
      testObj.req.params = { username: 'user1' };
      testObj.packageService.getAllByUsername.resolves([new UnknownException()]);

      const [error] = await testObj.packageController.getAllByUsernameInSelfInstance();

      testObj.packageService.getAllByUsername.should.have.callCount(1);
      testObj.packageService.getAllByUsername.should.have.calledWith(
        sinon.match(testObj.req.params.username),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully get all package with username in self instance`, async () => {
      testObj.req.params = { username: 'user1' };
      const outputModel1 = new PackageModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.userId = testObj.identifierGenerator.generateId();
      outputModel1.username = 'user1';
      outputModel1.password = 'pass1';
      outputModel1.countIp = 2;
      outputModel1.type = 'isp';
      outputModel1.country = 'GB';
      outputModel1.ipList = [
        { ip: '192.168.1.2', port: 8080 },
        { ip: '192.168.1.3', port: 8080 },
      ];
      outputModel1.isEnable = true;
      outputModel1.expireDate = new Date();
      outputModel1.insertDate = new Date();
      const outputModel2 = new PackageModel();
      outputModel2.id = testObj.identifierGenerator.generateId();
      outputModel2.userId = testObj.identifierGenerator.generateId();
      outputModel2.username = 'user1';
      outputModel2.countIp = 1;
      outputModel2.type = 'isp';
      outputModel2.country = 'GB';
      outputModel2.ipList = [{ ip: '192.168.1.4', port: 8080 }];
      outputModel2.isEnable = true;
      outputModel2.expireDate = new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000);
      outputModel2.insertDate = new Date();
      testObj.packageService.getAllByUsername.resolves([null, [outputModel1, outputModel2]]);

      const [error, result] = await testObj.packageController.getAllByUsernameInSelfInstance();

      testObj.packageService.getAllByUsername.should.have.callCount(1);
      testObj.packageService.getAllByUsername.should.have.calledWith(
        sinon.match(testObj.req.params.username),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.length(2);
      expect(result[0]).to.be.a('object');
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator.generateId(),
        username: 'user1',
        password: 'pass1',
        countIp: 2,
        type: 'isp',
        country: 'GB',
        isEnable: true,
      });
      expect(result[0].ipList[0]).to.have.include({
        ip: '192.168.1.2',
        port: 8080,
      });
      expect(result[0].ipList[1]).to.have.include({
        ip: '192.168.1.3',
        port: 8080,
      });
      expect(result[0].insertDate).to.have.match(testObj.dateRegex);
      expect(result[0].expireDate).to.have.match(testObj.expireRegex);
      expect(result[1]).to.be.a('object');
      expect(result[1]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator.generateId(),
        username: 'user1',
        countIp: 1,
        type: 'isp',
        country: 'GB',
        isEnable: true,
      });
      expect(result[1].ipList[0]).to.have.include({
        ip: '192.168.1.4',
        port: 8080,
      });
      expect(result[1].insertDate).to.have.match(testObj.dateRegex);
      expect(result[1].expireDate).to.have.match(testObj.expireRegex);
    });
  });

  suite(`Renew expire date package`, () => {
    test(`Should error renew expire date`, async () => {
      testObj.req.params = { packageId: testObj.identifierGenerator.generateId() };
      testObj.req.body = { expire: '2021-08-26' };
      testObj.findClusterPackageService.renew.resolves([new UnknownException()]);

      const [error] = await testObj.packageController.renewPackage();

      testObj.findClusterPackageService.renew.should.have.callCount(1);
      testObj.findClusterPackageService.renew.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
        sinon.match.instanceOf(Date),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully renew expire date`, async () => {
      testObj.req.params = { packageId: testObj.identifierGenerator.generateId() };
      testObj.req.body = { expire: '2021-08-26' };
      testObj.findClusterPackageService.renew.resolves([null]);

      const [error, result] = await testObj.packageController.renewPackage();

      testObj.findClusterPackageService.renew.should.have.callCount(1);
      testObj.findClusterPackageService.renew.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
        sinon.match.instanceOf(Date),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.a('object');
      expect(result).to.have.include({ expireDate: testObj.req.body.expire });
    });
  });

  suite(`Cancel package`, () => {
    test(`Should error renew expire date`, async () => {
      testObj.req.params = { packageId: testObj.identifierGenerator.generateId() };
      testObj.findClusterPackageService.cancel.resolves([new UnknownException()]);

      const [error] = await testObj.packageController.cancelPackage();

      testObj.findClusterPackageService.cancel.should.have.callCount(1);
      testObj.findClusterPackageService.cancel.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully renew expire date`, async () => {
      testObj.req.params = { packageId: testObj.identifierGenerator.generateId() };
      testObj.findClusterPackageService.cancel.resolves([null]);

      const [error, result] = await testObj.packageController.cancelPackage();

      testObj.findClusterPackageService.cancel.should.have.callCount(1);
      testObj.findClusterPackageService.cancel.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.a('undefined');
    });
  });

  suite(`Delete package`, () => {
    test(`Should error delete package`, async () => {
      testObj.req.params = { packageId: testObj.identifierGenerator.generateId() };
      testObj.findClusterPackageService.remove.resolves([new UnknownException()]);

      const [error] = await testObj.packageController.removePackage();

      testObj.findClusterPackageService.remove.should.have.callCount(1);
      testObj.findClusterPackageService.remove.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully delete package`, async () => {
      testObj.req.params = { packageId: testObj.identifierGenerator.generateId() };
      testObj.findClusterPackageService.remove.resolves([null]);

      const [error, result] = await testObj.packageController.removePackage();

      testObj.findClusterPackageService.remove.should.have.callCount(1);
      testObj.findClusterPackageService.remove.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.a('undefined');
    });
  });

  suite(`Sync package by id`, () => {
    test(`Should error sync package by id`, async () => {
      testObj.req.params = { packageId: testObj.identifierGenerator.generateId() };
      testObj.findClusterPackageService.syncPackageById.resolves([new UnknownException()]);

      const [error] = await testObj.packageController.syncPackage();

      testObj.findClusterPackageService.syncPackageById.should.have.callCount(1);
      testObj.findClusterPackageService.syncPackageById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully sync package by id`, async () => {
      testObj.req.params = { packageId: testObj.identifierGenerator.generateId() };
      testObj.findClusterPackageService.syncPackageById.resolves([null]);

      const [error, result] = await testObj.packageController.syncPackage();

      testObj.findClusterPackageService.syncPackageById.should.have.callCount(1);
      testObj.findClusterPackageService.syncPackageById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.a('undefined');
    });
  });
});
