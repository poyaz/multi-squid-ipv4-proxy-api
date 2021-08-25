/**
 * Created by pooya on 8/23/21.
 */

const sinon = require('sinon');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fakeIdentifierGenerator(type = '') {
  const IdentifierGenerator = require('~src/infrastructure/system/identifierGenerator');

  const identifierGenerator = sinon.createStubInstance(IdentifierGenerator);
  identifierGenerator.generateId = sinon.stub();

  switch (type) {
    case 'error-id':
      identifierGenerator.generateId.returns('99999999-9999-9999-9999-999999999999');
      break;
    case 'fake-id':
      identifierGenerator.generateId.returns('88888888-8888-8888-8888-888888888888');
      break;
    case 'id-1':
      identifierGenerator.generateId.returns('11111111-1111-1111-1111-111111111111');
      break;
    case 'id-2':
      identifierGenerator.generateId.returns('22222222-2222-2222-2222-222222222222');
      break;
    case 'id-3':
      identifierGenerator.generateId.returns('33333333-3333-3333-3333-333333333333');
      break;
    case 'id-4':
      identifierGenerator.generateId.returns('44444444-4444-4444-4444-444444444444');
      break;
    case 'id-5':
      identifierGenerator.generateId.returns('55555555-5555-5555-5555-555555555555');
      break;
    case 'id-6':
      identifierGenerator.generateId.returns('66666666-6666-6666-6666-666666666666');
      break;
    case 'id-7':
      identifierGenerator.generateId.returns('77777777-7777-7777-7777-777777777777');
      break;
    default:
      identifierGenerator.generateId.returns('00000000-0000-0000-0000-000000000000');
  }

  return identifierGenerator;
}

function fakeAddUserValidationMiddleware(req, res) {
  const AddUserValidationMiddleware = require('~src/api/http/user/middleware/addUserValidationMiddleware');

  const addUserValidationMiddleware = new AddUserValidationMiddleware(req, res);

  return { addUserValidationMiddleware };
}

function fakePasswordUserValidationMiddleware(req, res) {
  const ChangePasswordUserValidationMiddleware = require('~src/api/http/user/middleware/changePasswordUserValidationMiddleware');

  const changePasswordUserValidationMiddleware = new ChangePasswordUserValidationMiddleware(
    req,
    res,
  );

  return { changePasswordUserValidationMiddleware };
}

function fakeUserController(req, res) {
  const IUserService = require('~src/core/interface/iUserService');
  const DateTime = require('~src/infrastructure/system/dateTime');
  const UserController = require('~src/api/http/user/controller/userController');

  const userService = sinon.createStubInstance(IUserService);

  const dateTime = new DateTime();

  const userController = new UserController(req, res, userService, dateTime);

  return {
    userService,
    userController,
  };
}

function fakeUserService() {
  const IUserRepository = require('~src/core/interface/iUserRepository');
  const UserService = require('~src/core/service/userService');

  const userRepository = sinon.createStubInstance(IUserRepository);

  const userSquidRepository = sinon.createStubInstance(IUserRepository);

  const userService = new UserService(userRepository, userSquidRepository);

  return { userRepository, userSquidRepository, userService };
}

function fakeUserPgRepository() {
  const DateTime = require('~src/infrastructure/system/dateTime');
  const IIdentifierGenerator = require('~src/core/interface/iIdentifierGenerator');
  const UserPgRepository = require('~src/infrastructure/database/userPgRepository');

  const postgresDb = {};
  postgresDb.query = sinon.stub();

  const identifierGenerator = sinon.createStubInstance(IIdentifierGenerator);

  const dateTime = new DateTime();

  const userRepository = new UserPgRepository(postgresDb, dateTime, identifierGenerator);

  return { postgresDb, identifierGenerator, userRepository };
}

function fakeUserSquidRepository() {
  const UserSquidRepository = require('~src/infrastructure/system/userSquidRepository');

  const userSquidRepository = new UserSquidRepository('passwd-path');

  return { userSquidRepository };
}

module.exports = {
  sleep,
  fakeIdentifierGenerator,
  fakeAddUserValidationMiddleware,
  fakePasswordUserValidationMiddleware,
  fakeUserController,
  fakeUserService,
  fakeUserPgRepository,
  fakeUserSquidRepository,
};
