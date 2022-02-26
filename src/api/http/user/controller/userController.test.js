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

const UserModel = require('~src/core/model/userModel');
const UrlAccessModel = require('~src/core/model/urlAccessModel');
const UnknownException = require('~src/core/exception/unknownException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
chai.use(chaiAsPromised);

const expect = chai.expect;
const testObj = {};

suite(`UserController`, () => {
  setup(() => {
    testObj.req = new createRequest();
    testObj.res = new createResponse();

    const {
      userService,
      findClusterUserService,
      urlAccessService,
      userController,
    } = helper.fakeUserController(testObj.req, testObj.res);

    testObj.userService = userService;
    testObj.findClusterUserService = findClusterUserService;
    testObj.urlAccessService = urlAccessService;
    testObj.userController = userController;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.dateRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/;
  });

  suite(`Get all user`, () => {
    test(`Should error get all users`, async () => {
      testObj.findClusterUserService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.userController.getAllUsers();

      testObj.findClusterUserService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully get all users`, async () => {
      const outputModel1 = new UserModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.username = 'user1';
      outputModel1.isEnable = true;
      outputModel1.insertDate = new Date();
      const outputModel2 = new UserModel();
      outputModel2.id = testObj.identifierGenerator.generateId();
      outputModel2.username = 'user2';
      outputModel2.isEnable = false;
      testObj.findClusterUserService.getAll.resolves([null, [outputModel1, outputModel2]]);

      const [error, result] = await testObj.userController.getAllUsers();

      testObj.findClusterUserService.getAll.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(2);
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        username: 'user1',
      });
      expect(result[0].insertDate).to.have.match(testObj.dateRegex);
      expect(result[1]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        username: 'user2',
      });
      expect(result[1].insertDate).to.have.be.equal(null);
    });

    test(`Should successfully get all users (with username)`, async () => {
      const outputModel1 = new UserModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.username = 'user1';
      outputModel1.isEnable = true;
      outputModel1.insertDate = new Date();
      testObj.req.query = { username: 'user1' };
      testObj.findClusterUserService.getAll.resolves([null, [outputModel1]]);

      const [error, result] = await testObj.userController.getAllUsers();

      testObj.findClusterUserService.getAll.should.have.callCount(1);
      testObj.findClusterUserService.getAll.should.have.calledWith(
        sinon.match.has('username', 'user1'),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        username: 'user1',
      });
    });

    test(`Should successfully get all users (with isEnable)`, async () => {
      const outputModel1 = new UserModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.username = 'user1';
      outputModel1.isEnable = false;
      outputModel1.insertDate = new Date();
      testObj.req.query = { isEnable: 'false' };
      testObj.findClusterUserService.getAll.resolves([null, [outputModel1]]);

      const [error, result] = await testObj.userController.getAllUsers();

      testObj.findClusterUserService.getAll.should.have.callCount(1);
      testObj.findClusterUserService.getAll.should.have.calledWith(
        sinon.match.has('isEnable', false),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        username: 'user1',
      });
    });

    test(`Should successfully get all users (with username and isEnable)`, async () => {
      const outputModel1 = new UserModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.username = 'user1';
      outputModel1.isEnable = true;
      outputModel1.insertDate = new Date();
      testObj.req.query = { username: 'user1', isEnable: 'true' };
      testObj.findClusterUserService.getAll.resolves([null, [outputModel1]]);

      const [error, result] = await testObj.userController.getAllUsers();

      testObj.findClusterUserService.getAll.should.have.callCount(1);
      testObj.findClusterUserService.getAll.should.have.calledWith(
        sinon.match.has('username', 'user1').and(sinon.match.has('isEnable', true)),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        username: 'user1',
      });
    });
  });

  suite(`Add new user`, () => {
    test(`Should error add new user`, async () => {
      testObj.req.body = { username: 'username', password: 'password' };
      testObj.findClusterUserService.add.resolves([new UnknownException()]);

      const [error] = await testObj.userController.addUser();

      testObj.findClusterUserService.add.should.have.callCount(1);
      testObj.findClusterUserService.add.should.have.calledWith(
        sinon.match
          .instanceOf(UserModel)
          .and(sinon.match.has('username', sinon.match.string))
          .and(sinon.match.has('password', sinon.match.string)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully add new user`, async () => {
      testObj.req.body = { username: 'username', password: 'password' };
      const outputModel = new UserModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.username = testObj.req.body.username;
      outputModel.insertDate = new Date();
      testObj.findClusterUserService.add.resolves([null, outputModel]);

      const [error, result] = await testObj.userController.addUser();

      testObj.findClusterUserService.add.should.have.callCount(1);
      testObj.findClusterUserService.add.should.have.calledWith(
        sinon.match
          .instanceOf(UserModel)
          .and(sinon.match.has('username', sinon.match.string))
          .and(sinon.match.has('password', sinon.match.string)),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.a('object');
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        username: testObj.req.body.username,
      });
      expect(result.insertDate).to.have.match(testObj.dateRegex);
    });
  });

  suite(`Change password`, () => {
    test(`Should error change password`, async () => {
      testObj.req.params = { username: 'user1' };
      testObj.req.body = { password: 'password' };
      testObj.findClusterUserService.changePassword.resolves([new UnknownException()]);

      const [error] = await testObj.userController.changePassword();

      testObj.findClusterUserService.changePassword.should.have.callCount(1);
      testObj.findClusterUserService.changePassword.should.have.calledWith('user1', 'password');
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully change password`, async () => {
      testObj.req.params = { username: 'user1' };
      testObj.req.body = { password: 'password' };
      testObj.findClusterUserService.changePassword.resolves([null]);

      const [error] = await testObj.userController.changePassword();

      testObj.findClusterUserService.changePassword.should.have.callCount(1);
      testObj.findClusterUserService.changePassword.should.have.calledWith('user1', 'password');
      expect(error).to.be.a('null');
    });
  });

  suite(`Disable user by username`, () => {
    test(`Should error disable user by username`, async () => {
      testObj.req.params = { username: 'user1' };
      testObj.findClusterUserService.disableByUsername.resolves([new UnknownException()]);

      const [error] = await testObj.userController.disableByUsername();

      testObj.findClusterUserService.disableByUsername.should.have.callCount(1);
      testObj.findClusterUserService.disableByUsername.should.have.calledWith('user1');
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should error disable user by username`, async () => {
      testObj.req.params = { username: 'user1' };
      testObj.findClusterUserService.disableByUsername.resolves([null]);

      const [error] = await testObj.userController.disableByUsername();

      testObj.findClusterUserService.disableByUsername.should.have.callCount(1);
      testObj.findClusterUserService.disableByUsername.should.have.calledWith('user1');
      expect(error).to.be.a('null');
    });
  });

  suite(`Enable user by username`, () => {
    test(`Should error enable user by username`, async () => {
      testObj.req.params = { username: 'user1' };
      testObj.findClusterUserService.enableByUsername.resolves([new UnknownException()]);

      const [error] = await testObj.userController.enableByUsername();

      testObj.findClusterUserService.enableByUsername.should.have.callCount(1);
      testObj.findClusterUserService.enableByUsername.should.have.calledWith('user1');
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should error enable user by username`, async () => {
      testObj.req.params = { username: 'user1' };
      testObj.findClusterUserService.enableByUsername.resolves([null]);

      const [error] = await testObj.userController.enableByUsername();

      testObj.findClusterUserService.enableByUsername.should.have.callCount(1);
      testObj.findClusterUserService.enableByUsername.should.have.calledWith('user1');
      expect(error).to.be.a('null');
    });
  });

  suite(`Block website for user`, () => {
    test(`Should error block website for user`, async () => {
      testObj.req.params = { username: 'user1' };
      testObj.req.body = {
        urls: ['google.com'],
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 60000),
      };
      testObj.urlAccessService.add.resolves([new UnknownException()]);

      const [error] = await testObj.userController.blockAccessToUrlByUsername();

      testObj.urlAccessService.add.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully block website for user`, async () => {
      testObj.req.params = { username: 'user1' };
      testObj.req.body = {
        urls: ['google.com'],
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 60000),
      };
      const outputModel = new UrlAccessModel();
      testObj.urlAccessService.add.resolves([null, outputModel]);

      const [error] = await testObj.userController.blockAccessToUrlByUsername();

      testObj.urlAccessService.add.should.have.callCount(1);
      testObj.urlAccessService.add.should.have.calledWith(
        sinon.match
          .instanceOf(UrlAccessModel)
          .and(sinon.match.has('username', 'user1'))
          .and(sinon.match.hasNested('urlList[0].url', 'google.com'))
          .and(sinon.match.has('startDate', sinon.match.instanceOf(Date)))
          .and(sinon.match.has('endDate', sinon.match.instanceOf(Date))),
      );
      expect(error).to.be.a('null');
    });
  });

  suite(`Check website block for user`, () => {
    test(`Should error check website block for user`, async () => {
      testObj.req.params = { username: 'user1', domain: 'google.com' };
      testObj.urlAccessService.checkBlockDomainForUsername.resolves([new UnknownException()]);

      const [error] = await testObj.userController.checkBlockDomainForUsername();

      testObj.urlAccessService.checkBlockDomainForUsername.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully check website block for user`, async () => {
      testObj.req.params = { username: 'user1', domain: 'google.com' };
      testObj.urlAccessService.checkBlockDomainForUsername.resolves([null, false]);

      const [error, result] = await testObj.userController.checkBlockDomainForUsername();

      testObj.urlAccessService.checkBlockDomainForUsername.should.have.callCount(1);
      testObj.urlAccessService.checkBlockDomainForUsername.should.have.calledWith(
        sinon.match('user1'),
        sinon.match('google.com'),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.a('object');
      expect(result).to.have.include({ isBlock: false });
    });
  });

  suite(`Add new user in self instance`, () => {
    test(`Should error add new user in self instance`, async () => {
      testObj.req.body = { username: 'username', password: 'password' };
      testObj.userService.add.resolves([new UnknownException()]);

      const [error] = await testObj.userController.addUserInSelfInstance();

      testObj.userService.add.should.have.callCount(1);
      testObj.userService.add.should.have.calledWith(
        sinon.match
          .instanceOf(UserModel)
          .and(sinon.match.has('username', sinon.match.string))
          .and(sinon.match.has('password', sinon.match.string)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully add new user in self instance`, async () => {
      testObj.req.body = { username: 'username', password: 'password' };
      const outputModel = new UserModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.username = testObj.req.body.username;
      outputModel.insertDate = new Date();
      testObj.userService.add.resolves([null, outputModel]);

      const [error, result] = await testObj.userController.addUserInSelfInstance();

      testObj.userService.add.should.have.callCount(1);
      testObj.userService.add.should.have.calledWith(
        sinon.match
          .instanceOf(UserModel)
          .and(sinon.match.has('username', sinon.match.string))
          .and(sinon.match.has('password', sinon.match.string)),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.a('object');
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        username: testObj.req.body.username,
      });
      expect(result.insertDate).to.have.match(testObj.dateRegex);
    });
  });

  suite(`Change password in self instance`, () => {
    test(`Should error change password in self instance`, async () => {
      testObj.req.params = { username: 'user1' };
      testObj.req.body = { password: 'password' };
      testObj.userService.changePassword.resolves([new UnknownException()]);

      const [error] = await testObj.userController.changePasswordInSelfInstance();

      testObj.userService.changePassword.should.have.callCount(1);
      testObj.userService.changePassword.should.have.calledWith('user1', 'password');
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully change password in self instance`, async () => {
      testObj.req.params = { username: 'user1' };
      testObj.req.body = { password: 'password' };
      testObj.userService.changePassword.resolves([null]);

      const [error] = await testObj.userController.changePasswordInSelfInstance();

      testObj.userService.changePassword.should.have.callCount(1);
      testObj.userService.changePassword.should.have.calledWith('user1', 'password');
      expect(error).to.be.a('null');
    });
  });

  suite(`Disable user by username in self instance`, () => {
    test(`Should error disable user by username in self instance`, async () => {
      testObj.req.params = { username: 'user1' };
      testObj.userService.disableByUsername.resolves([new UnknownException()]);

      const [error] = await testObj.userController.disableByUsernameInSelfInstance();

      testObj.userService.disableByUsername.should.have.callCount(1);
      testObj.userService.disableByUsername.should.have.calledWith('user1');
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should error disable user by username in self instance`, async () => {
      testObj.req.params = { username: 'user1' };
      testObj.userService.disableByUsername.resolves([null]);

      const [error] = await testObj.userController.disableByUsernameInSelfInstance();

      testObj.userService.disableByUsername.should.have.callCount(1);
      testObj.userService.disableByUsername.should.have.calledWith('user1');
      expect(error).to.be.a('null');
    });
  });

  suite(`Enable user by username in self instance`, () => {
    test(`Should error enable user by username in self instance`, async () => {
      testObj.req.params = { username: 'user1' };
      testObj.userService.enableByUsername.resolves([new UnknownException()]);

      const [error] = await testObj.userController.enableByUsernameInSelfInstance();

      testObj.userService.enableByUsername.should.have.callCount(1);
      testObj.userService.enableByUsername.should.have.calledWith('user1');
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should error enable user by username in self instance`, async () => {
      testObj.req.params = { username: 'user1' };
      testObj.userService.enableByUsername.resolves([null]);

      const [error] = await testObj.userController.enableByUsernameInSelfInstance();

      testObj.userService.enableByUsername.should.have.callCount(1);
      testObj.userService.enableByUsername.should.have.calledWith('user1');
      expect(error).to.be.a('null');
    });
  });
});
