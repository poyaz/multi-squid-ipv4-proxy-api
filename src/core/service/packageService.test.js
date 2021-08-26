/**
 * Created by pooya on 8/25/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const UserModel = require('~src/core/model/userModel');
const PackageModel = require('~src/core/model/packageModel');
const UnknownException = require('~src/core/exception/unknownException');
const DisableUserException = require('~src/core/exception/disableUserException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`PackageService`, () => {
  setup(() => {
    const {
      userService,
      packageRepository,
      packageFileRepository,
      proxySquidRepository,
      packageService,
    } = helper.fakePackageService();

    testObj.userService = userService;
    testObj.packageRepository = packageRepository;
    testObj.packageFileRepository = packageFileRepository;
    testObj.proxySquidRepository = proxySquidRepository;
    testObj.packageService = packageService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
  });

  suite(`Add new package`, () => {
    test(`Should error add new package when fetch user info`, async () => {
      const inputModel = new PackageModel();
      inputModel.username = 'user1';
      inputModel.countIp = 1;
      inputModel.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      testObj.userService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.add(inputModel);

      testObj.userService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error add new package when user disable`, async () => {
      const inputModel = new PackageModel();
      inputModel.username = 'user1';
      inputModel.countIp = 1;
      inputModel.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      const outputFetchUser1 = new UserModel();
      outputFetchUser1.id = testObj.identifierGenerator.generateId();
      outputFetchUser1.username = 'user1';
      outputFetchUser1.isEnable = false;
      outputFetchUser1.insertDate = new Date();
      testObj.userService.getAll.resolves([null, [outputFetchUser1]]);

      const [error] = await testObj.packageService.add(inputModel);

      testObj.userService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DisableUserException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error add new package when add new package in database`, async () => {
      const inputModel = new PackageModel();
      inputModel.username = 'user1';
      inputModel.countIp = 1;
      inputModel.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      const outputFetchUser1 = new UserModel();
      outputFetchUser1.id = testObj.identifierGenerator.generateId();
      outputFetchUser1.username = 'user1';
      outputFetchUser1.isEnable = true;
      outputFetchUser1.insertDate = new Date();
      testObj.userService.getAll.resolves([null, [outputFetchUser1]]);
      testObj.packageRepository.add.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.add(inputModel);

      testObj.userService.getAll.should.have.callCount(1);
      testObj.packageRepository.add.should.have.callCount(1);
      testObj.packageRepository.add.should.have.calledWith(
        sinon.match
          .instanceOf(PackageModel)
          .and(sinon.match.has('userId', testObj.identifierGenerator.generateId())),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error add new package when add new package in file`, async () => {
      const inputModel = new PackageModel();
      inputModel.username = 'user1';
      inputModel.countIp = 1;
      inputModel.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      const outputFetchUser1 = new UserModel();
      outputFetchUser1.id = testObj.identifierGenerator.generateId();
      outputFetchUser1.username = 'user1';
      outputFetchUser1.isEnable = true;
      outputFetchUser1.insertDate = new Date();
      const outputAddPackage = new PackageModel();
      outputAddPackage.username = 'user1';
      outputAddPackage.countIp = 1;
      outputAddPackage.ipList = [{ ip: '192.168.1.3', port: 8080 }];
      outputAddPackage.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      outputAddPackage.insertDate = new Date();
      testObj.userService.getAll.resolves([null, [outputFetchUser1]]);
      testObj.packageRepository.add.resolves([null, outputAddPackage]);
      testObj.packageFileRepository.add.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.add(inputModel);

      testObj.userService.getAll.should.have.callCount(1);
      testObj.packageRepository.add.should.have.callCount(1);
      testObj.packageRepository.add.should.have.calledWith(
        sinon.match
          .instanceOf(PackageModel)
          .and(sinon.match.has('userId', testObj.identifierGenerator.generateId())),
      );
      testObj.packageFileRepository.add.should.have.callCount(1);
      testObj.packageFileRepository.add.should.have.calledWith(
        sinon.match
          .instanceOf(PackageModel)
          .and(sinon.match.hasNested('ipList[0].ip', '192.168.1.3'))
          .and(sinon.match.hasNested('ipList[0].port', 8080)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully add new package`, async () => {
      const inputModel = new PackageModel();
      inputModel.username = 'user1';
      inputModel.countIp = 1;
      inputModel.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      const outputFetchUser1 = new UserModel();
      outputFetchUser1.id = testObj.identifierGenerator.generateId();
      outputFetchUser1.username = 'user1';
      outputFetchUser1.isEnable = true;
      outputFetchUser1.insertDate = new Date();
      const outputAddPackage = new PackageModel();
      outputAddPackage.username = 'user1';
      outputAddPackage.countIp = 1;
      outputAddPackage.ipList = [{ ip: '192.168.1.3', port: 8080 }];
      outputAddPackage.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      outputAddPackage.insertDate = new Date();
      testObj.userService.getAll.resolves([null, [outputFetchUser1]]);
      testObj.packageRepository.add.resolves([null, outputAddPackage]);
      testObj.packageFileRepository.add.resolves([null]);
      testObj.proxySquidRepository.reload.resolves([null]);

      const [error, result] = await testObj.packageService.add(inputModel);

      testObj.userService.getAll.should.have.callCount(1);
      testObj.packageRepository.add.should.have.callCount(1);
      testObj.proxySquidRepository.reload.should.have.callCount(1);
      testObj.packageRepository.add.should.have.calledWith(
        sinon.match
          .instanceOf(PackageModel)
          .and(sinon.match.has('userId', testObj.identifierGenerator.generateId())),
      );
      testObj.packageFileRepository.add.should.have.callCount(1);
      testObj.packageFileRepository.add.should.have.calledWith(
        sinon.match
          .instanceOf(PackageModel)
          .and(sinon.match.hasNested('ipList[0].ip', '192.168.1.3'))
          .and(sinon.match.hasNested('ipList[0].port', 8080)),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceOf(PackageModel);
    });
  });
});
