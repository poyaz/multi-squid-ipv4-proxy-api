/**
 * Created by pooya on 8/24/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const fs = require('fs');
const fsAsync = require('fs/promises');
const child_process = require('child_process');
const { PassThrough } = require('stream');
const UserModel = require('~src/core/model/userModel');
const CommandExecuteException = require('~src/core/exception/commandExecuteException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

/**
 * @property eventually
 * @property rejectedWith
 */
const expect = chai.expect;
const testObj = {};

suite(`UserSquidRepository`, () => {
  suiteSetup(() => {
    sinon.stub(fsAsync, 'access');
    sinon.stub(fsAsync, 'open');
    sinon.stub(fs, 'closeSync');
    sinon.stub(child_process, 'spawn');
  });

  suiteTeardown(() => {
    fsAsync.access.restore();
    fsAsync.open.restore();
    fs.closeSync.restore();
    child_process.spawn.restore();
  });

  setup(() => {
    const { userSquidRepository } = helper.fakeUserSquidRepository();

    testObj.userSquidRepository = userSquidRepository;

    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
  });

  teardown(() => {
    fsAsync.access.resetHistory();
    fsAsync.open.resetHistory();
    fs.closeSync.resetHistory();
    child_process.spawn.resetHistory();
  });

  suite(`Check user exist`, () => {
    test(`Should error check user exist when check file exist in path`, async () => {
      const inputUsername = 'username';
      const commandError = new Error('Command error');
      fsAsync.access.throws(commandError);

      const [error] = await testObj.userSquidRepository.isUserExist(inputUsername);

      fsAsync.access.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should error check user exist when execute command check user command`, async () => {
      const inputUsername = 'username';
      fsAsync.access.resolves();
      const commandError = new Error('Command error');
      child_process.spawn.throws(commandError);

      const [error] = await testObj.userSquidRepository.isUserExist(inputUsername);

      fsAsync.access.should.have.callCount(1);
      child_process.spawn.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should error check user exist when stderr on execute check user command and have error`, async () => {
      const inputUsername = 'username';
      child_process.spawn.returns();
      child_process.spawn.callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.write('Command error');
        stderr.end();

        return { stderr, stdin };
      });

      const [error] = await testObj.userSquidRepository.isUserExist(inputUsername);

      fsAsync.access.should.have.callCount(1);
      child_process.spawn.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error.errorInfo).to.be.an.instanceof(Error);
    });

    test(`Should successfully check user exist and return false (file not exist)`, async () => {
      const inputUsername = 'username';
      const fileNotFoundError = new Error('File not found');
      fileNotFoundError.code = 'ENOENT';
      fsAsync.access.throws(fileNotFoundError);

      const [error, result] = await testObj.userSquidRepository.isUserExist(inputUsername);

      fsAsync.access.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.a('boolean').and.equal(false);
    });

    test(`Should successfully check user exist and return false when execute check user command and user not exist`, async () => {
      const inputUsername = 'username';
      fsAsync.access.resolves();
      child_process.spawn.returns();
      child_process.spawn.callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        setTimeout(() => {
          stderr.write(`User ${inputUsername} not found`);
          stderr.end();
        });

        return { stderr, stdin };
      });

      const [error, result] = await testObj.userSquidRepository.isUserExist(inputUsername);

      fsAsync.access.should.have.callCount(1);
      child_process.spawn.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.a('boolean').and.equal(false);
    });

    test(`Should successfully check user exist and return true when execute check user command and user not exist`, async () => {
      const inputUsername = 'username';
      fsAsync.access.resolves();
      child_process.spawn.returns();
      child_process.spawn.callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.write(`password verification failed`);
        stderr.end();

        return { stderr, stdin };
      });

      const [error, result] = await testObj.userSquidRepository.isUserExist(inputUsername);

      fsAsync.access.should.have.callCount(1);
      child_process.spawn.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.a('boolean').and.equal(true);
    });
  });

  suite(`Add new user`, () => {
    test(`Should error add user when check file exist in path`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'username';
      inputModel.password = 'password';
      const commandError = new Error('Command error');
      fsAsync.access.throws(commandError);

      const [error] = await testObj.userSquidRepository.add(inputModel);

      fsAsync.access.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should error add user when file not exist and want create file`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'username';
      inputModel.password = 'password';
      const fileNotFoundError = new Error('File not found');
      fileNotFoundError.code = 'ENOENT';
      const commandError = new Error('File not found');
      fsAsync.access.throws(fileNotFoundError);
      fsAsync.open.throws(commandError);

      const [error] = await testObj.userSquidRepository.add(inputModel);

      fsAsync.access.should.have.callCount(1);
      fsAsync.open.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should error add user when execute add user command (after build file)`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'username';
      inputModel.password = 'password';
      const fileNotFoundError = new Error('File not found');
      fileNotFoundError.code = 'ENOENT';
      fsAsync.access.throws(fileNotFoundError);
      fsAsync.open.resolves();
      fs.closeSync.returns();
      const commandError = new Error('Command error');
      child_process.spawn.throws(commandError);

      const [error] = await testObj.userSquidRepository.add(inputModel);

      fsAsync.access.should.have.callCount(1);
      fsAsync.open.should.have.callCount(1);
      fs.closeSync.should.have.callCount(1);
      child_process.spawn.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should error add user when stderr on execute add user command (after build file)`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'username';
      inputModel.password = 'password';
      const fileNotFoundError = new Error('File not found');
      fileNotFoundError.code = 'ENOENT';
      fsAsync.access.throws(fileNotFoundError);
      fsAsync.open.resolves();
      fs.closeSync.returns();
      child_process.spawn.returns();
      child_process.spawn.callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.write(`Command error`);
        stderr.end();

        return { stderr, stdin };
      });

      const [error] = await testObj.userSquidRepository.add(inputModel);

      fsAsync.access.should.have.callCount(1);
      fsAsync.open.should.have.callCount(1);
      fs.closeSync.should.have.callCount(1);
      child_process.spawn.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error.errorInfo).to.have.instanceOf(Error);
    });

    test(`Should error add user (file exist)`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'username';
      inputModel.password = 'password';
      fsAsync.access.resolves();
      child_process.spawn.returns();
      child_process.spawn.callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.end();

        return { stderr, stdin };
      });

      const [error, result] = await testObj.userSquidRepository.add(inputModel);

      fsAsync.access.should.have.callCount(1);
      fsAsync.open.should.have.callCount(0);
      fs.closeSync.should.have.callCount(0);
      child_process.spawn.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(UserModel).and.have.property('password', '');
    });

    test(`Should error add user (file not exist)`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'username';
      inputModel.password = 'password';
      const fileNotFoundError = new Error('File not found');
      fileNotFoundError.code = 'ENOENT';
      fsAsync.access.throws(fileNotFoundError);
      fsAsync.open.resolves();
      fs.closeSync.returns();
      child_process.spawn.returns();
      child_process.spawn.callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.end();

        return { stderr, stdin };
      });

      const [error, result] = await testObj.userSquidRepository.add(inputModel);

      fsAsync.access.should.have.callCount(1);
      fsAsync.open.should.have.callCount(1);
      fs.closeSync.should.have.callCount(1);
      child_process.spawn.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(UserModel).and.have.property('password', '');
    });
  });

  suite(`Update user`, () => {
    test(`Should error update user when execute`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'user1';
      inputModel.password = 'password';
      const commandError = new Error('Command error');
      child_process.spawn.throws(commandError);

      const [error] = await testObj.userSquidRepository.update(inputModel);

      child_process.spawn.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should error update user when have stderr`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'user1';
      inputModel.password = 'password';
      child_process.spawn.returns();
      child_process.spawn.callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.write(`Command error`);
        stderr.end();

        return { stderr, stdin };
      });

      const [error] = await testObj.userSquidRepository.update(inputModel);

      child_process.spawn.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error.errorInfo).to.have.instanceOf(Error);
    });

    test(`Should successfully update user`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'user1';
      inputModel.password = 'password';
      child_process.spawn.returns();
      child_process.spawn.callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.end();

        return { stderr, stdin };
      });

      const [error] = await testObj.userSquidRepository.update(inputModel);

      child_process.spawn.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });
});
