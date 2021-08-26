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
const NotFoundException = require('~src/core/exception/notFoundException');
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

  suite(`Get all package by username`, () => {
    test(`Should error get all package by username when check user exist`, async () => {
      const inputUsername = 'user1';
      testObj.userService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.getAllByUsername(inputUsername);

      testObj.userService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error get all package by username when user not found`, async () => {
      const inputUsername = 'user1';
      testObj.userService.getAll.resolves([null, []]);

      const [error] = await testObj.packageService.getAllByUsername(inputUsername);

      testObj.userService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(NotFoundException);
      expect(error).to.have.property('httpCode', 404);
    });

    test(`Should error get all package by username when fetch from database`, async () => {
      const inputUsername = 'user1';
      testObj.userService.getAll.resolves([null, [new UserModel()]]);
      testObj.packageRepository.getAllByUsername.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.getAllByUsername(inputUsername);

      testObj.userService.getAll.should.have.callCount(1);
      testObj.packageRepository.getAllByUsername.should.have.callCount(1);
      testObj.packageRepository.getAllByUsername.should.have.calledWith(sinon.match(inputUsername));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error get all package by username when fetch from file`, async () => {
      const inputUsername = 'user1';
      testObj.userService.getAll.resolves([null, [new UserModel()]]);
      testObj.packageRepository.getAllByUsername.resolves([null, []]);
      testObj.packageFileRepository.getAllByUsername.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.getAllByUsername(inputUsername);

      testObj.userService.getAll.should.have.callCount(1);
      testObj.packageRepository.getAllByUsername.should.have.callCount(1);
      testObj.packageRepository.getAllByUsername.should.have.calledWith(sinon.match(inputUsername));
      testObj.packageFileRepository.getAllByUsername.should.have.callCount(1);
      testObj.packageFileRepository.getAllByUsername.should.have.calledWith(
        sinon.match(inputUsername),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully get all package by username and merge ip list (return empty list)`, async () => {
      const inputUsername = 'user1';
      testObj.userService.getAll.resolves([null, [new UserModel()]]);
      const outputFetchModel1 = new PackageModel();
      outputFetchModel1.id = testObj.identifierGenerator.generateId();
      outputFetchModel1.userId = testObj.identifierGenerator.generateId();
      outputFetchModel1.username = 'user1';
      outputFetchModel1.countIp = 1;
      outputFetchModel1.ipList = [{ ip: '192.168.1.2', port: 8080 }];
      outputFetchModel1.expireDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
      testObj.packageRepository.getAllByUsername.resolves([null, [outputFetchModel1]]);
      testObj.packageFileRepository.getAllByUsername.resolves([null, []]);

      const [error, result] = await testObj.packageService.getAllByUsername(inputUsername);

      testObj.userService.getAll.should.have.callCount(1);
      testObj.packageRepository.getAllByUsername.should.have.callCount(1);
      testObj.packageRepository.getAllByUsername.should.have.calledWith(sinon.match(inputUsername));
      testObj.packageFileRepository.getAllByUsername.should.have.callCount(1);
      testObj.packageFileRepository.getAllByUsername.should.have.calledWith(
        sinon.match(inputUsername),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should successfully get all package by username and merge ip list`, async () => {
      const inputUsername = 'user1';
      testObj.userService.getAll.resolves([null, [new UserModel()]]);
      const outputFetchModel1 = new PackageModel();
      outputFetchModel1.id = testObj.identifierGenerator.generateId();
      outputFetchModel1.userId = testObj.identifierGenerator.generateId();
      outputFetchModel1.username = 'user1';
      outputFetchModel1.countIp = 3;
      outputFetchModel1.ipList = [
        { ip: '192.168.1.2', port: 8080 },
        { ip: '192.168.1.3', port: 8080 },
        { ip: '192.168.1.4', port: 8080 },
      ];
      outputFetchModel1.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      const outputFetchModel2 = new PackageModel();
      outputFetchModel2.id = testObj.identifierGenerator.generateId();
      outputFetchModel2.userId = testObj.identifierGenerator.generateId();
      outputFetchModel2.username = 'user1';
      outputFetchModel2.countIp = 2;
      outputFetchModel2.ipList = [
        { ip: '192.168.1.5', port: 8080 },
        { ip: '192.168.1.6', port: 8080 },
      ];
      outputFetchModel2.expireDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
      testObj.packageRepository.getAllByUsername.resolves([
        null,
        [outputFetchModel1, outputFetchModel2],
      ]);
      const outputFileModel1 = new PackageModel();
      outputFileModel1.username = 'user1';
      outputFileModel1.countIp = 1;
      outputFileModel1.ipList = [{ ip: '192.168.1.3', port: 8080 }];
      testObj.packageFileRepository.getAllByUsername.resolves([null, [outputFileModel1]]);

      const [error, result] = await testObj.packageService.getAllByUsername(inputUsername);

      testObj.userService.getAll.should.have.callCount(1);
      testObj.packageRepository.getAllByUsername.should.have.callCount(1);
      testObj.packageRepository.getAllByUsername.should.have.calledWith(sinon.match(inputUsername));
      testObj.packageFileRepository.getAllByUsername.should.have.callCount(1);
      testObj.packageFileRepository.getAllByUsername.should.have.calledWith(
        sinon.match(inputUsername),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.length(2);
      expect(result[0]).to.be.an.instanceof(PackageModel);
      expect(result[0].countIp).to.be.equal(1);
      expect(result[0].ipList[0]).to.have.include({ ip: '192.168.1.3', port: 8080 });
      expect(result[1]).to.be.an.instanceof(PackageModel);
      expect(result[1].countIp).to.be.equal(2);
      expect(result[1].ipList[0]).to.have.include({ ip: '192.168.1.5', port: 8080 });
      expect(result[1].ipList[1]).to.have.include({ ip: '192.168.1.6', port: 8080 });
    });
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
