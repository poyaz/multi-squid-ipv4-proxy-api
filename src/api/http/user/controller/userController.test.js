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

    const { userService, userController } = helper.fakeUserController(testObj.req, testObj.res);

    testObj.userService = userService;
    testObj.userController = userController;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.dateRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/;
  });

  suite(`Add new user`, () => {
    test(`Should error add new user`, async () => {
      testObj.req.body = { username: 'username', password: 'password' };
      testObj.userService.add.resolves([new UnknownException()]);

      const [error] = await testObj.userController.addUser();

      testObj.userService.add.should.have.callCount(1);
      testObj.userService.add.should.have.calledWith(
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
      testObj.userService.add.resolves([null, outputModel]);

      const [error, result] = await testObj.userController.addUser();

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
});
