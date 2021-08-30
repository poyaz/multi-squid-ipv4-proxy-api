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

    const { packageService, packageController } = helper.fakePackageController(
      testObj.req,
      testObj.res,
    );

    testObj.packageService = packageService;
    testObj.packageController = packageController;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.dateRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/;
    testObj.expireRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
  });

  suite(`Create new package`, () => {
    test(`Should error create new package`, async () => {
      testObj.req.body = { username: 'user1', countIp: 1, expire: '2021-08-25' };
      testObj.packageService.add.resolves([new UnknownException()]);

      const [error] = await testObj.packageController.addPackage();

      testObj.packageService.add.should.have.callCount(1);
      testObj.packageService.add.should.have.calledWith(sinon.match.instanceOf(PackageModel));
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully create new package`, async () => {
      testObj.req.body = { username: 'user1', countIp: 1, expire: '2021-08-25' };
      const outputModel = new PackageModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.userId = testObj.identifierGenerator.generateId();
      outputModel.username = 'user1';
      outputModel.countIp = 1;
      outputModel.ipList = [{ ip: '192.168.1.2', port: 8080 }];
      outputModel.insertDate = new Date();
      outputModel.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      testObj.packageService.add.resolves([null, outputModel]);

      const [error, result] = await testObj.packageController.addPackage();

      testObj.packageService.add.should.have.callCount(1);
      testObj.packageService.add.should.have.calledWith(sinon.match.instanceOf(PackageModel));
      expect(error).to.be.a('null');
      expect(result).to.be.a('object');
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator.generateId(),
        username: testObj.req.body.username,
        countIp: 1,
      });
      expect(result.insertDate).to.have.match(testObj.dateRegex);
      expect(result.expireDate).to.have.match(testObj.expireRegex);
    });
  });

  suite(`Get all package by username`, () => {
    test(`Should error get all package with username`, async () => {
      testObj.req.params = { username: 'user1' };
      testObj.packageService.getAllByUsername.resolves([new UnknownException()]);

      const [error] = await testObj.packageController.getAllByUsername();

      testObj.packageService.getAllByUsername.should.have.callCount(1);
      testObj.packageService.getAllByUsername.should.have.calledWith(
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
      outputModel1.countIp = 2;
      outputModel1.ipList = [
        { ip: '192.168.1.2', port: 8080 },
        { ip: '192.168.1.3', port: 8080 },
      ];
      outputModel1.expireDate = new Date();
      outputModel1.insertDate = new Date();
      const outputModel2 = new PackageModel();
      outputModel2.id = testObj.identifierGenerator.generateId();
      outputModel2.userId = testObj.identifierGenerator.generateId();
      outputModel2.username = 'user1';
      outputModel2.countIp = 1;
      outputModel2.ipList = [{ ip: '192.168.1.4', port: 8080 }];
      outputModel2.expireDate = new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000);
      outputModel2.insertDate = new Date();
      testObj.packageService.getAllByUsername.resolves([null, [outputModel1, outputModel2]]);

      const [error, result] = await testObj.packageController.getAllByUsername();

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
        countIp: 2,
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
      testObj.packageService.renew.resolves([new UnknownException()]);

      const [error] = await testObj.packageController.renewPackage();

      testObj.packageService.renew.should.have.callCount(1);
      testObj.packageService.renew.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
        sinon.match.instanceOf(Date),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully renew expire date`, async () => {
      testObj.req.params = { packageId: testObj.identifierGenerator.generateId() };
      testObj.req.body = { expire: '2021-08-26' };
      testObj.packageService.renew.resolves([null]);

      const [error, result] = await testObj.packageController.renewPackage();

      testObj.packageService.renew.should.have.callCount(1);
      testObj.packageService.renew.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
        sinon.match.instanceOf(Date),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.a('object');
      expect(result).to.have.include({ expireDate: testObj.req.body.expire });
    });
  });
});
