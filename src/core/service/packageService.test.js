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
const ItemDisableException = require('~src/core/exception/itemDisableException');
const DisableUserException = require('~src/core/exception/disableUserException');
const AlreadyExpireException = require('~src/core/exception/alreadyExpireException');

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
      testObj.packageRepository.getById.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.getById(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error get package by id when not exist`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.packageRepository.getById.resolves([null, null]);

      const [error] = await testObj.packageService.getById(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(NotFoundException);
      expect(error).to.have.property('httpCode', 404);
    });

    test(`Should successfully get package by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputFetchModel = testObj.outputFetchModel;
      testObj.packageRepository.getById.resolves([null, outputFetchModel]);

      const [error, result] = await testObj.packageService.getById(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(PackageModel);
      expect(result.countIp).to.be.equal(3);
    });
  });

  suite(`Get all package by username`, () => {
    test(`Should error get all package by username when check user exist`, async () => {
      const inputUsername = 'user1';
      const inputFilterModel = new PackageModel();
      testObj.userService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.getAllByUsername(
        inputUsername,
        inputFilterModel,
      );

      testObj.userService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error get all package by username when user not found`, async () => {
      const inputUsername = 'user1';
      const inputFilterModel = new PackageModel();
      testObj.userService.getAll.resolves([null, []]);

      const [error] = await testObj.packageService.getAllByUsername(
        inputUsername,
        inputFilterModel,
      );

      testObj.userService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(NotFoundException);
      expect(error).to.have.property('httpCode', 404);
    });

    test(`Should error get all package by username when fetch from database`, async () => {
      const inputUsername = 'user1';
      const inputFilterModel = new PackageModel();
      testObj.userService.getAll.resolves([null, [new UserModel()]]);
      testObj.packageRepository.getAllByUsername.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.getAllByUsername(
        inputUsername,
        inputFilterModel,
      );

      testObj.userService.getAll.should.have.callCount(1);
      testObj.packageRepository.getAllByUsername.should.have.callCount(1);
      testObj.packageRepository.getAllByUsername.should.have.calledWith(
        sinon.match(inputUsername),
        sinon.match.instanceOf(PackageModel),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error get all package by username when fetch from file`, async () => {
      const inputUsername = 'user1';
      const inputFilterModel = new PackageModel();
      testObj.userService.getAll.resolves([null, [new UserModel()]]);
      testObj.packageRepository.getAllByUsername.resolves([null, []]);
      testObj.packageFileRepository.getAllByUsername.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.getAllByUsername(
        inputUsername,
        inputFilterModel,
      );

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

    test(`Should successfully get all package by username and merge ip list (return empty package is enable)`, async () => {
      const inputUsername = 'user1';
      const inputFilterModel = new PackageModel();
      testObj.userService.getAll.resolves([null, [new UserModel()]]);
      const outputFetchModel1 = new PackageModel();
      outputFetchModel1.id = testObj.identifierGenerator.generateId();
      outputFetchModel1.userId = testObj.identifierGenerator.generateId();
      outputFetchModel1.username = 'user1';
      outputFetchModel1.countIp = 1;
      outputFetchModel1.ipList = [{ ip: '192.168.1.2', port: 8080 }];
      outputFetchModel1.expireDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
      outputFetchModel1.status = PackageModel.STATUS_ENABLE;
      testObj.packageRepository.getAllByUsername.resolves([null, [outputFetchModel1]]);
      testObj.packageFileRepository.getAllByUsername.resolves([null, []]);

      const [error, result] = await testObj.packageService.getAllByUsername(
        inputUsername,
        inputFilterModel,
      );

      testObj.userService.getAll.should.have.callCount(1);
      testObj.packageRepository.getAllByUsername.should.have.callCount(1);
      testObj.packageRepository.getAllByUsername.should.have.calledWith(
        sinon.match(inputUsername),
        sinon.match.instanceOf(PackageModel),
      );
      testObj.packageFileRepository.getAllByUsername.should.have.callCount(1);
      testObj.packageFileRepository.getAllByUsername.should.have.calledWith(
        sinon.match(inputUsername),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should successfully get all package by username and merge ip list`, async () => {
      const inputUsername = 'user1';
      const inputFilterModel = new PackageModel();
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
      outputFetchModel1.status = PackageModel.STATUS_ENABLE;
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
      outputFetchModel2.status = PackageModel.STATUS_EXPIRE;
      testObj.packageRepository.getAllByUsername.resolves([
        null,
        [outputFetchModel1, outputFetchModel2],
      ]);
      const outputFileModel1 = new PackageModel();
      outputFileModel1.username = 'user1';
      outputFileModel1.countIp = 1;
      outputFileModel1.ipList = [{ ip: '192.168.1.3', port: 8080 }];
      testObj.packageFileRepository.getAllByUsername.resolves([null, [outputFileModel1]]);

      const [error, result] = await testObj.packageService.getAllByUsername(
        inputUsername,
        inputFilterModel,
      );

      testObj.userService.getAll.should.have.callCount(1);
      testObj.packageRepository.getAllByUsername.should.have.callCount(1);
      testObj.packageRepository.getAllByUsername.should.have.calledWith(
        sinon.match(inputUsername),
        sinon.match.instanceOf(PackageModel),
      );
      testObj.packageFileRepository.getAllByUsername.should.have.callCount(1);
      testObj.packageFileRepository.getAllByUsername.should.have.calledWith(
        sinon.match(inputUsername),
      );
      expect(error).to.be.a('null');console.log(result)
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
          .and(sinon.match.has('userId', testObj.identifierGenerator.generateId()))
          .and(sinon.match.has('status', PackageModel.STATUS_ENABLE)),
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
          .and(sinon.match.has('userId', testObj.identifierGenerator.generateId()))
          .and(sinon.match.has('status', PackageModel.STATUS_ENABLE)),
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
      outputFetchUser1.password = 'pass1';
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
          .and(sinon.match.has('userId', testObj.identifierGenerator.generateId()))
          .and(sinon.match.has('status', PackageModel.STATUS_ENABLE)),
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
      expect(result.password).to.be.equal('pass1');
    });
  });

  suite(`Renew expire date`, () => {
    test(`Should error renew expire date when check package exist`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const inputExpireDate = new Date();
      testObj.packageRepository.getById.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.renew(inputId, inputExpireDate);

      testObj.packageRepository.getById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error renew expire date when package not exist`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const inputExpireDate = new Date();
      testObj.packageRepository.getById.resolves([null, null]);

      const [error] = await testObj.packageService.renew(inputId, inputExpireDate);

      testObj.packageRepository.getById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(NotFoundException);
      expect(error).to.have.property('httpCode', 404);
    });

    test(`Should error renew expire date when expire date not valid`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const inputExpireDate = new Date();
      const outputFetchModel = new PackageModel();
      outputFetchModel.expireDate = new Date();
      testObj.packageRepository.getById.resolves([null, outputFetchModel]);

      const [error] = await testObj.packageService.renew(inputId, inputExpireDate);

      testObj.packageRepository.getById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(AlreadyExpireException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error renew expire date when update`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const inputExpireDate = new Date();
      const outputFetchModel = new PackageModel();
      outputFetchModel.expireDate = new Date(new Date().getTime() + 60000);
      testObj.packageRepository.getById.resolves([null, outputFetchModel]);
      testObj.packageRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.renew(inputId, inputExpireDate);

      testObj.packageRepository.getById.should.have.callCount(1);
      testObj.packageRepository.update.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully renew expire date`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const inputExpireDate = new Date();
      const outputFetchModel = new PackageModel();
      outputFetchModel.expireDate = new Date(new Date().getTime() + 60000);
      testObj.packageRepository.getById.resolves([null, outputFetchModel]);
      testObj.packageRepository.update.resolves([null]);

      const [error] = await testObj.packageService.renew(inputId, inputExpireDate);

      testObj.packageRepository.getById.should.have.callCount(1);
      testObj.packageRepository.update.should.have.callCount(1);
      testObj.packageRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(PackageModel)
          .and(sinon.match.has('id', testObj.identifierGenerator.generateId()))
          .and(sinon.match.has('expireDate', sinon.match.instanceOf(Date))),
      );
      expect(error).to.be.a('null');
    });
  });

  suite(`Cancel package`, () => {
    setup(() => {
      testObj.consoleError = sinon.stub(console, 'error');
    });

    teardown(() => {
      testObj.consoleError.restore();
    });

    test(`Should error cancel package when fetch package id fail`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.packageRepository.getById.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.cancel(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error cancel package when package not exist`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.packageRepository.getById.resolves([null, null]);

      const [error] = await testObj.packageService.cancel(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(NotFoundException);
      expect(error).to.have.property('httpCode', 404);
    });

    test(`Should error cancel package when package already expired`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputFetchModel = new PackageModel();
      outputFetchModel.status = PackageModel.STATUS_ENABLE;
      outputFetchModel.expireDate = new Date(new Date().getTime() - 60000);
      testObj.packageRepository.getById.resolves([null, outputFetchModel]);

      const [error] = await testObj.packageService.cancel(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(AlreadyExpireException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error cancel package when package is not enable`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputFetchModel = new PackageModel();
      outputFetchModel.status = PackageModel.STATUS_DISABLE;
      testObj.packageRepository.getById.resolves([null, outputFetchModel]);

      const [error] = await testObj.packageService.cancel(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(ItemDisableException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error cancel package when update expire date`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputFetchModel = new PackageModel();
      outputFetchModel.status = PackageModel.STATUS_ENABLE;
      testObj.packageRepository.getById.resolves([null, outputFetchModel]);
      testObj.packageRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.cancel(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      testObj.packageRepository.update.should.have.callCount(1);
      testObj.packageRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(PackageModel)
          .and(sinon.match.has('status', PackageModel.STATUS_CANCEL))
          .and(
            sinon.match.has(
              'expireDate',
              new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
            ),
          ),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully cancel package`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputFetchModel = new PackageModel();
      outputFetchModel.status = PackageModel.STATUS_ENABLE;
      testObj.packageRepository.getById.resolves([null, outputFetchModel]);
      testObj.packageRepository.update.resolves([null]);

      const [error] = await testObj.packageService.cancel(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      testObj.packageRepository.update.should.have.callCount(1);
      testObj.packageRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(PackageModel)
          .and(sinon.match.has('status', PackageModel.STATUS_CANCEL))
          .and(
            sinon.match.has(
              'expireDate',
              new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
            ),
          ),
      );
      expect(error).to.be.a('null');
    });
  });

  suite(`Disable expire package`, () => {
    setup(() => {
      testObj.consoleError = sinon.stub(console, 'error');
    });

    teardown(() => {
      testObj.consoleError.restore();
    });

    test(`Should error disable expire package when fetch expire package`, async () => {
      testObj.packageRepository.getAllExpirePackage.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.disableExpirePackage();

      testObj.packageRepository.getAllExpirePackage.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error disable expire package when remove package from proxy`, async () => {
      const outputModeList = [new PackageModel()];
      testObj.packageRepository.getAllExpirePackage.resolves([null, outputModeList]);
      testObj.packageFileRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.disableExpirePackage();

      testObj.packageRepository.getAllExpirePackage.should.have.callCount(1);
      testObj.packageFileRepository.update.should.have.callCount(1);
      testObj.consoleError.should.callCount(1);
      testObj.proxySquidRepository.reload.should.have.callCount(0);
      expect(error).to.be.a('null');
    });

    test(`Should successfully disable expire package with no reload and update (no record find)`, async () => {
      const outputModeList = [];
      testObj.packageRepository.getAllExpirePackage.resolves([null, outputModeList]);

      const [error, result] = await testObj.packageService.disableExpirePackage();

      testObj.packageRepository.getAllExpirePackage.should.have.callCount(1);
      testObj.packageFileRepository.update.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should successfully disable expire package with reload`, async () => {
      const outputModel1 = new PackageModel();
      outputModel1.username = 'user1';
      outputModel1.countIp = 2;
      outputModel1.ipList = [
        { ip: '192.168.1.1', port: 8080 },
        { ip: '192.168.1.2', port: 8080 },
      ];
      outputModel1.expireDate = new Date();
      const outputModel2 = new PackageModel();
      outputModel2.username = 'user2';
      outputModel2.countIp = 1;
      outputModel2.ipList = [{ ip: '192.168.1.3', port: 8080 }];
      outputModel2.expireDate = new Date();
      const outputModeList = [outputModel1, outputModel2];
      testObj.packageRepository.getAllExpirePackage.resolves([null, outputModeList]);
      testObj.packageFileRepository.update.resolves([null]);
      testObj.packageRepository.update.resolves([null]);

      const [error, result] = await testObj.packageService.disableExpirePackage();

      testObj.packageRepository.getAllExpirePackage.should.have.callCount(1);
      testObj.packageFileRepository.update.should.have.callCount(2);
      testObj.packageFileRepository.update.should.have.calledWith(
        sinon.match.instanceOf(PackageModel),
      );
      testObj.packageRepository.update.should.have.callCount(2);
      testObj.packageRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(PackageModel)
          .and(sinon.match.has('status', PackageModel.STATUS_EXPIRE)),
      );
      testObj.proxySquidRepository.reload.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(2);
    });

    test(`Should successfully disable expire package with reload (with error in update proxy file)`, async () => {
      const outputModel1 = new PackageModel();
      outputModel1.username = 'user1';
      outputModel1.countIp = 2;
      outputModel1.ipList = [
        { ip: '192.168.1.1', port: 8080 },
        { ip: '192.168.1.2', port: 8080 },
      ];
      outputModel1.expireDate = new Date();
      const outputModel2 = new PackageModel();
      outputModel2.username = 'user2';
      outputModel2.countIp = 1;
      outputModel2.ipList = [{ ip: '192.168.1.3', port: 8080 }];
      outputModel2.expireDate = new Date();
      const outputModeList = [outputModel1, outputModel2];
      testObj.packageRepository.getAllExpirePackage.resolves([null, outputModeList]);
      testObj.packageFileRepository.update.onCall(0).resolves([new UnknownException()]);
      testObj.packageFileRepository.update.onCall(1).resolves([null]);
      testObj.packageRepository.update.resolves([null]);

      const [error, result] = await testObj.packageService.disableExpirePackage();

      testObj.packageRepository.getAllExpirePackage.should.have.callCount(1);
      testObj.packageFileRepository.update.should.have.callCount(2);
      testObj.packageFileRepository.update.should.have.calledWith(
        sinon.match.instanceOf(PackageModel),
      );
      testObj.packageRepository.update.should.have.callCount(1);
      testObj.packageRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(PackageModel)
          .and(sinon.match.has('status', PackageModel.STATUS_EXPIRE)),
      );
      testObj.consoleError.should.callCount(1);
      testObj.proxySquidRepository.reload.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
    });

    test(`Should successfully disable expire package with reload (with error in update package status)`, async () => {
      const outputModel1 = new PackageModel();
      outputModel1.username = 'user1';
      outputModel1.countIp = 2;
      outputModel1.ipList = [
        { ip: '192.168.1.1', port: 8080 },
        { ip: '192.168.1.2', port: 8080 },
      ];
      outputModel1.expireDate = new Date();
      const outputModel2 = new PackageModel();
      outputModel2.username = 'user2';
      outputModel2.countIp = 1;
      outputModel2.ipList = [{ ip: '192.168.1.3', port: 8080 }];
      outputModel2.expireDate = new Date();
      const outputModeList = [outputModel1, outputModel2];
      testObj.packageRepository.getAllExpirePackage.resolves([null, outputModeList]);
      testObj.packageRepository.getAllExpirePackage.resolves([null, outputModeList]);
      testObj.packageFileRepository.update.resolves([null]);
      testObj.packageRepository.update.onCall(0).resolves([new UnknownException()]);
      testObj.packageRepository.update.onCall(1).resolves([null]);

      const [error, result] = await testObj.packageService.disableExpirePackage();

      testObj.packageRepository.getAllExpirePackage.should.have.callCount(1);
      testObj.packageFileRepository.update.should.have.callCount(2);
      testObj.packageFileRepository.update.should.have.calledWith(
        sinon.match.instanceOf(PackageModel),
      );
      testObj.packageRepository.update.should.have.callCount(2);
      testObj.packageRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(PackageModel)
          .and(sinon.match.has('status', PackageModel.STATUS_EXPIRE)),
      );
      testObj.consoleError.should.callCount(1);
      testObj.proxySquidRepository.reload.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
    });
  });

  suite(`Remove package`, () => {
    test(`Should error remove package when check exist package id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.packageRepository.getById.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.remove(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      testObj.packageRepository.getById.should.have.calledWith(sinon.match(inputId));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error remove package when package not found`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.packageRepository.getById.resolves([null, null]);

      const [error] = await testObj.packageService.remove(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      testObj.packageRepository.getById.should.have.calledWith(sinon.match(inputId));
      expect(error).to.be.an.instanceof(NotFoundException);
      expect(error).to.have.property('httpCode', 404);
    });

    test(`Should error remove package when remove package from proxy`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputPackageModel = new PackageModel();
      outputPackageModel.username = 'user1';
      outputPackageModel.countIp = 2;
      outputPackageModel.ipList = [
        { ip: '192.168.1.1', port: 8080 },
        { ip: '192.168.1.2', port: 8080 },
      ];
      testObj.packageRepository.getById.resolves([null, outputPackageModel]);
      testObj.packageFileRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.remove(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      testObj.packageRepository.getById.should.have.calledWith(sinon.match(inputId));
      testObj.packageFileRepository.update.should.have.callCount(1);
      testObj.packageFileRepository.update.should.have.calledWith(
        sinon.match.instanceOf(PackageModel),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error remove package when remove package from database`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputPackageModel = new PackageModel();
      outputPackageModel.username = 'user1';
      outputPackageModel.countIp = 2;
      outputPackageModel.ipList = [
        { ip: '192.168.1.1', port: 8080 },
        { ip: '192.168.1.2', port: 8080 },
      ];
      testObj.packageRepository.getById.resolves([null, outputPackageModel]);
      testObj.packageFileRepository.update.resolves([null]);
      testObj.packageRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.remove(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      testObj.packageRepository.getById.should.have.calledWith(sinon.match(inputId));
      testObj.packageFileRepository.update.should.have.callCount(1);
      testObj.packageFileRepository.update.should.have.calledWith(
        sinon.match.instanceOf(PackageModel),
      );
      testObj.packageRepository.update.should.have.callCount(1);
      testObj.packageRepository.update.should.have.calledWith(
        sinon.match.instanceOf(PackageModel).and(sinon.match.has('expireDate', sinon.match.date)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully remove package`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputPackageModel = new PackageModel();
      outputPackageModel.username = 'user1';
      outputPackageModel.countIp = 2;
      outputPackageModel.ipList = [
        { ip: '192.168.1.1', port: 8080 },
        { ip: '192.168.1.2', port: 8080 },
      ];
      testObj.packageRepository.getById.resolves([null, outputPackageModel]);
      testObj.packageFileRepository.update.resolves([null]);
      testObj.packageRepository.update.resolves([null]);
      testObj.proxySquidRepository.reload.resolves([null]);

      const [error] = await testObj.packageService.remove(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      testObj.packageRepository.getById.should.have.calledWith(sinon.match(inputId));
      testObj.packageFileRepository.update.should.have.callCount(1);
      testObj.packageFileRepository.update.should.have.calledWith(
        sinon.match.instanceOf(PackageModel),
      );
      testObj.packageRepository.update.should.have.callCount(1);
      testObj.packageRepository.update.should.have.calledWith(
        sinon.match.instanceOf(PackageModel).and(sinon.match.has('expireDate', sinon.match.date)),
      );
      testObj.proxySquidRepository.reload.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });

  suite(`Sync package with id`, () => {
    test(`Should error sync package when get package info`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.packageRepository.getById.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.syncPackageById(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error sync package when package not found`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.packageRepository.getById.resolves([null, null]);

      const [error] = await testObj.packageService.syncPackageById(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(NotFoundException);
      expect(error).to.have.property('httpCode', 404);
    });

    test(`Should error sync package when fetch user info`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputPackageModel = new PackageModel();
      outputPackageModel.id = testObj.identifierGenerator.generateId();
      outputPackageModel.username = 'user1';
      testObj.packageRepository.getById.resolves([null, outputPackageModel]);
      testObj.userService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.syncPackageById(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      testObj.userService.getAll.should.have.callCount(1);
      testObj.userService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error sync package when user not found`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputPackageModel = new PackageModel();
      outputPackageModel.id = testObj.identifierGenerator.generateId();
      outputPackageModel.username = 'user1';
      testObj.packageRepository.getById.resolves([null, outputPackageModel]);
      testObj.userService.getAll.resolves([null, []]);

      const [error] = await testObj.packageService.syncPackageById(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      testObj.userService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(NotFoundException);
      expect(error).to.have.property('httpCode', 404);
    });

    test(`Should error sync package when update package file`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputPackageModel = new PackageModel();
      outputPackageModel.id = testObj.identifierGenerator.generateId();
      outputPackageModel.username = 'user1';
      outputPackageModel.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      testObj.packageRepository.getById.resolves([null, outputPackageModel]);
      const outputUserModel = new UserModel();
      outputUserModel.isEnable = true;
      testObj.userService.getAll.resolves([null, [outputUserModel]]);
      testObj.packageFileRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.packageService.syncPackageById(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      testObj.userService.getAll.should.have.callCount(1);
      testObj.packageFileRepository.update.should.have.callCount(1);
      testObj.packageFileRepository.update.should.have.calledWith(
        sinon.match.has('deleteDate', null),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful sync package`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputPackageModel = new PackageModel();
      outputPackageModel.id = testObj.identifierGenerator.generateId();
      outputPackageModel.username = 'user1';
      outputPackageModel.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      testObj.packageRepository.getById.resolves([null, outputPackageModel]);
      const outputUserModel = new UserModel();
      outputUserModel.isEnable = true;
      testObj.userService.getAll.resolves([null, [outputUserModel]]);
      testObj.packageFileRepository.update.resolves([null]);
      testObj.proxySquidRepository.reload.resolves([null]);

      const [error] = await testObj.packageService.syncPackageById(inputId);

      testObj.packageRepository.getById.should.have.callCount(1);
      testObj.userService.getAll.should.have.callCount(1);
      testObj.packageFileRepository.update.should.have.callCount(1);
      testObj.packageFileRepository.update.should.have.calledWith(
        sinon.match.has('deleteDate', null),
      );
      testObj.proxySquidRepository.reload.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });
});
