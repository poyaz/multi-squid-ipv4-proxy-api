/**
 * Created by pooya on 8/25/21.
 */

/**
 * Created by pooya on 8/23/21.
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
});
