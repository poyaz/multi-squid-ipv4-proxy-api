/**
 * Created by pooya on 2/21/22.
 */

/**
 * Created by pooya on 8/23/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const UserModel = require('~src/core/model/userModel');
const ServerModel = require('~src/core/model/serverModel');
const PackageModel = require('~src/core/model/packageModel');
const UserExistException = require('~src/core/exception/userExistException');
const UnknownException = require('~src/core/exception/unknownException');
const NotFoundException = require('~src/core/exception/notFoundException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`FindClusterUserService`, () => {
  setup(() => {
    const {
      userService,
      serverService,
      serverApiRepository,
      findClusterUserService,
    } = helper.fakeFindClusterUserService('10.10.10.4');

    testObj.userService = userService;
    testObj.serverService = serverService;
    testObj.serverApiRepository = serverApiRepository;
    testObj.findClusterUserService = findClusterUserService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
  });

  suite(`Get all users`, () => {
    test(`Should error get all users`, async () => {
      const filterInput = new UserModel();
      testObj.userService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterUserService.getAll(filterInput);

      testObj.userService.getAll.should.have.callCount(1);
      testObj.userService.getAll.should.have.calledWith(sinon.match.instanceOf(UserModel));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully get all users`, async () => {
      const filterInput = new UserModel();
      const outputModel1 = new UserModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.username = 'user1';
      outputModel1.isEnable = true;
      outputModel1.insertDate = new Date();
      const outputModel2 = new UserModel();
      outputModel2.id = testObj.identifierGenerator.generateId();
      outputModel2.username = 'user1';
      outputModel2.isEnable = true;
      outputModel2.insertDate = new Date();
      testObj.userService.getAll.resolves([null, [outputModel1, outputModel2]]);

      const [error, result] = await testObj.findClusterUserService.getAll(filterInput);

      testObj.userService.getAll.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.length(2);
      expect(result[0]).to.have.instanceOf(UserModel);
      expect(result[1]).to.have.instanceOf(UserModel);
    });
  });

  suite(`Check username and password`, () => {
    test(`Should error check username and password`, async () => {
      const inputUsername = 'username';
      const inputPassword = 'password';
      testObj.userService.checkUsernameAndPassword.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterUserService.checkUsernameAndPassword(
        inputUsername,
        inputPassword,
      );

      testObj.userService.checkUsernameAndPassword.should.have.callCount(1);
      testObj.userService.checkUsernameAndPassword.should.have.calledWith(
        sinon.match(inputUsername),
        sinon.match(inputPassword),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully check username and password`, async () => {
      const inputUsername = 'username';
      const inputPassword = 'password';
      const outputModel = new UserModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.username = 'user1';
      outputModel.isEnable = true;
      outputModel.insertDate = new Date();
      testObj.userService.checkUsernameAndPassword.resolves([null, outputModel]);

      const [error, result] = await testObj.findClusterUserService.checkUsernameAndPassword(
        inputUsername,
        inputPassword,
      );

      testObj.userService.checkUsernameAndPassword.should.have.callCount(1);
      testObj.userService.checkUsernameAndPassword.should.have.calledWith(
        sinon.match(inputUsername),
        sinon.match(inputPassword),
      );
      expect(error).to.be.a('null');
      expect(result).to.have.instanceOf(UserModel);
    });
  });

  suite(`Add new user`, () => {
    test(`Should error add new user when get all instance has fail`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'user1';
      inputModel.password = '123456';
      testObj.serverService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterUserService.add(inputModel);

      testObj.serverService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error add new user in current instance because not found any server`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'user1';
      inputModel.password = '123456';
      testObj.serverService.getAll.resolves([null, []]);
      testObj.userService.add.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterUserService.add(inputModel);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.userService.add.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful add new user in current instance because not found any server`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'user1';
      inputModel.password = '123456';
      testObj.serverService.getAll.resolves([null, []]);
      const outputAddUser = new PackageModel();
      outputAddUser.username = 'user1';
      outputAddUser.password = '123456';
      outputAddUser.insertDate = new Date();
      testObj.userService.add.resolves([null, outputAddUser]);

      const [error, result] = await testObj.findClusterUserService.add(inputModel);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.userService.add.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceOf(PackageModel);
    });

    test(`Should error add new user in all instance when send request has been fail in all server or at least one server`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'user1';
      inputModel.password = '123456';
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
      const outputAddUser = new PackageModel();
      outputAddUser.username = 'user1';
      outputAddUser.password = '123456';
      outputAddUser.insertDate = new Date();
      testObj.userService.add.resolves([null, outputAddUser]);
      testObj.serverApiRepository.addUser.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterUserService.add(inputModel);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.userService.add.should.have.callCount(1);
      testObj.serverApiRepository.addUser.should.have.callCount(2);
      testObj.serverApiRepository.addUser.should.have.calledWith(
        sinon.match.instanceOf(UserModel).and(sinon.match.has('password', inputModel.password)),
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful add new user in all instance`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'user1';
      inputModel.password = '123456';
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
      const outputAddUser = new PackageModel();
      outputAddUser.username = 'user1';
      outputAddUser.password = '123456';
      outputAddUser.insertDate = new Date();
      testObj.userService.add.resolves([null, outputAddUser]);
      testObj.serverApiRepository.addUser.resolves([null]);

      const [error] = await testObj.findClusterUserService.add(inputModel);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.userService.add.should.have.callCount(1);
      testObj.serverApiRepository.addUser.should.have.callCount(2);
      testObj.serverApiRepository.addUser.should.have.calledWith(
        sinon.match.instanceOf(UserModel).and(sinon.match.has('password', inputModel.password)),
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.a('null');
    });
  });

  suite(`Change password`, () => {
    test(`Should error change password when get all instance has fail`, async () => {
      const inputUsername = 'user1';
      const inputPassword = '123456';
      testObj.serverService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterUserService.changePassword(
        inputUsername,
        inputPassword,
      );

      testObj.serverService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error change password in current instance because not found any server`, async () => {
      const inputUsername = 'user1';
      const inputPassword = '123456';
      testObj.serverService.getAll.resolves([null, []]);
      testObj.userService.changePassword.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterUserService.changePassword(
        inputUsername,
        inputPassword,
      );

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.userService.changePassword.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful change password in current instance because not found any server`, async () => {
      const inputUsername = 'user1';
      const inputPassword = '123456';
      const outputAddUser = new PackageModel();
      outputAddUser.username = 'user1';
      outputAddUser.password = '123456';
      outputAddUser.insertDate = new Date();
      testObj.serverService.getAll.resolves([null, []]);
      testObj.userService.changePassword.resolves([null, outputAddUser]);

      const [error] = await testObj.findClusterUserService.changePassword(
        inputUsername,
        inputPassword,
      );

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.userService.changePassword.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should error change password in all instance when send request has been fail in all server or at least one server`, async () => {
      const inputUsername = 'user1';
      const inputPassword = '123456';
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
      const outputAddUser = new PackageModel();
      outputAddUser.username = 'user1';
      outputAddUser.password = '123456';
      outputAddUser.insertDate = new Date();
      testObj.userService.changePassword.resolves([null, outputAddUser]);
      testObj.serverApiRepository.changeUserPassword.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterUserService.changePassword(
        inputUsername,
        inputPassword,
      );

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.userService.changePassword.should.have.callCount(1);
      testObj.serverApiRepository.changeUserPassword.should.have.callCount(2);
      testObj.serverApiRepository.changeUserPassword.should.have.calledWith(
        sinon.match(inputUsername),
        sinon.match(inputPassword),
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful change password in all instance`, async () => {
      const inputUsername = 'user1';
      const inputPassword = '123456';
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
      const outputAddUser = new PackageModel();
      outputAddUser.username = 'user1';
      outputAddUser.password = '123456';
      outputAddUser.insertDate = new Date();
      testObj.userService.changePassword.resolves([null, outputAddUser]);
      testObj.serverApiRepository.changeUserPassword.resolves([null]);

      const [error] = await testObj.findClusterUserService.changePassword(
        inputUsername,
        inputPassword,
      );

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.userService.changePassword.should.have.callCount(1);
      testObj.serverApiRepository.changeUserPassword.should.have.callCount(2);
      testObj.serverApiRepository.changeUserPassword.should.have.calledWith(
        sinon.match(inputUsername),
        sinon.match(inputPassword),
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.a('null');
    });
  });

  suite(`Disable user`, () => {
    test(`Should error disable user when get all instance has fail`, async () => {
      const inputUsername = 'user1';
      testObj.serverService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterUserService.disableByUsername(inputUsername);

      testObj.serverService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error disable user in current instance because not found any server`, async () => {
      const inputUsername = 'user1';
      testObj.serverService.getAll.resolves([null, []]);
      testObj.userService.disableByUsername.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterUserService.disableByUsername(inputUsername);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.userService.disableByUsername.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful disable user in current instance because not found any server`, async () => {
      const inputUsername = 'user1';
      const outputAddUser = new PackageModel();
      outputAddUser.username = 'user1';
      outputAddUser.password = '123456';
      outputAddUser.insertDate = new Date();
      testObj.serverService.getAll.resolves([null, []]);
      testObj.userService.disableByUsername.resolves([null, outputAddUser]);

      const [error] = await testObj.findClusterUserService.disableByUsername(inputUsername);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.userService.disableByUsername.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should error disable user in all instance when send request has been fail in all server or at least one server`, async () => {
      const inputUsername = 'user1';
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
      const outputAddUser = new PackageModel();
      outputAddUser.username = 'user1';
      outputAddUser.password = '123456';
      outputAddUser.insertDate = new Date();
      testObj.userService.disableByUsername.resolves([null, outputAddUser]);
      testObj.serverApiRepository.changeUserStatus.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterUserService.disableByUsername(inputUsername);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.userService.disableByUsername.should.have.callCount(1);
      testObj.serverApiRepository.changeUserStatus.should.have.callCount(2);
      testObj.serverApiRepository.changeUserStatus.should.have.calledWith(
        sinon.match(inputUsername),
        sinon.match(false),
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful disable user in all instance`, async () => {
      const inputUsername = 'user1';
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
      const outputAddUser = new PackageModel();
      outputAddUser.username = 'user1';
      outputAddUser.password = '123456';
      outputAddUser.insertDate = new Date();
      testObj.userService.disableByUsername.resolves([null, outputAddUser]);
      testObj.serverApiRepository.changeUserStatus.resolves([null]);

      const [error] = await testObj.findClusterUserService.disableByUsername(inputUsername);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.userService.disableByUsername.should.have.callCount(1);
      testObj.serverApiRepository.changeUserStatus.should.have.callCount(2);
      testObj.serverApiRepository.changeUserStatus.should.have.calledWith(
        sinon.match(inputUsername),
        sinon.match(false),
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.a('null');
    });
  });

  suite(`Enable user`, () => {
    test(`Should error enable user when get all instance has fail`, async () => {
      const inputUsername = 'user1';
      testObj.serverService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterUserService.enableByUsername(inputUsername);

      testObj.serverService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error enable user in current instance because not found any server`, async () => {
      const inputUsername = 'user1';
      testObj.serverService.getAll.resolves([null, []]);
      testObj.userService.enableByUsername.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterUserService.enableByUsername(inputUsername);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.userService.enableByUsername.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful enable user in current instance because not found any server`, async () => {
      const inputUsername = 'user1';
      const outputAddUser = new PackageModel();
      outputAddUser.username = 'user1';
      outputAddUser.password = '123456';
      outputAddUser.insertDate = new Date();
      testObj.serverService.getAll.resolves([null, []]);
      testObj.userService.enableByUsername.resolves([null, outputAddUser]);

      const [error] = await testObj.findClusterUserService.enableByUsername(inputUsername);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.userService.enableByUsername.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should error enable user in all instance when send request has been fail in all server or at least one server`, async () => {
      const inputUsername = 'user1';
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
      const outputAddUser = new PackageModel();
      outputAddUser.username = 'user1';
      outputAddUser.password = '123456';
      outputAddUser.insertDate = new Date();
      testObj.userService.enableByUsername.resolves([null, outputAddUser]);
      testObj.serverApiRepository.changeUserStatus.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterUserService.enableByUsername(inputUsername);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.userService.enableByUsername.should.have.callCount(1);
      testObj.serverApiRepository.changeUserStatus.should.have.callCount(2);
      testObj.serverApiRepository.changeUserStatus.should.have.calledWith(
        sinon.match(inputUsername),
        sinon.match(true),
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful enable user in all instance`, async () => {
      const inputUsername = 'user1';
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
      const outputAddUser = new PackageModel();
      outputAddUser.username = 'user1';
      outputAddUser.password = '123456';
      outputAddUser.insertDate = new Date();
      testObj.userService.enableByUsername.resolves([null, outputAddUser]);
      testObj.serverApiRepository.changeUserStatus.resolves([null]);

      const [error] = await testObj.findClusterUserService.enableByUsername(inputUsername);

      testObj.serverService.getAll.should.have.callCount(1);
      testObj.userService.enableByUsername.should.have.callCount(1);
      testObj.serverApiRepository.changeUserStatus.should.have.callCount(2);
      testObj.serverApiRepository.changeUserStatus.should.have.calledWith(
        sinon.match(inputUsername),
        sinon.match(true),
        sinon.match.instanceOf(ServerModel),
      );
      expect(error).to.be.a('null');
    });
  });
});
