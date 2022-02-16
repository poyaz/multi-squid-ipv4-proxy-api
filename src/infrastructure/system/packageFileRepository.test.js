/**
 * Created by pooya on 8/26/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const fsAsync = require('fs/promises');
const childProcess = require('child_process');
const { PassThrough } = require('stream');
const PackageModel = require('~src/core/model/packageModel');
const CommandExecuteException = require('~src/core/exception/commandExecuteException');
const ModelUsernameNotExistException = require('~src/core/exception/modelUsernameNotExistException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

/**
 * @property eventually
 * @property rejectedWith
 */
const expect = chai.expect;
const testObj = {};

suite(`PackageFileRepository`, () => {
  suiteSetup(() => {
    sinon.stub(fsAsync, 'appendFile');
    sinon.stub(fsAsync, 'access');
    sinon.stub(fsAsync, 'readFile');
    sinon.stub(childProcess, 'spawn');
  });

  suiteTeardown(() => {
    fsAsync.appendFile.restore();
    fsAsync.access.restore();
    fsAsync.readFile.restore();
    childProcess.spawn.restore();
  });

  setup(() => {
    const { packageFileRepository } = helper.fakePackageFileRepository();

    testObj.packageFileRepository = packageFileRepository;

    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
  });

  teardown(() => {
    fsAsync.appendFile.resetHistory();
    fsAsync.access.resetHistory();
    fsAsync.readFile.resetHistory();
    childProcess.spawn.resetHistory();
  });

  suite(`Get all package by username`, () => {
    test(`Should error get all package by username when check exist file`, async () => {
      const inputUsername = 'user1';
      const commandError = new Error('Command error');
      fsAsync.access.throws(commandError);

      const [error] = await testObj.packageFileRepository.getAllByUsername(inputUsername);

      fsAsync.access.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should error get all package by username when check exist file`, async () => {
      const inputUsername = 'user1';
      fsAsync.access.resolves();
      const commandError = new Error('Command error');
      fsAsync.readFile.throws(commandError);

      const [error] = await testObj.packageFileRepository.getAllByUsername(inputUsername);

      fsAsync.access.should.have.callCount(1);
      fsAsync.readFile.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should successfully get all package by username and return empty list (if file not exist)`, async () => {
      const inputUsername = 'user1';
      const fileNotFoundError = new Error('File not found');
      fileNotFoundError.code = 'ENOENT';
      fsAsync.access.throws(fileNotFoundError);

      const [error, result] = await testObj.packageFileRepository.getAllByUsername(inputUsername);

      fsAsync.access.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should error get all package by username when check exist file`, async () => {
      const inputUsername = 'user1';
      fsAsync.access.resolves();
      const outputFileRead =
        '192.168.1.2 user1\n192.168.1.3 user2\nunknown row data\n192.168.1.4 user1';
      fsAsync.readFile.resolves(outputFileRead);

      const [error, result] = await testObj.packageFileRepository.getAllByUsername(inputUsername);

      fsAsync.access.should.have.callCount(1);
      fsAsync.readFile.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.an.instanceof(PackageModel);
      expect(result[0].username).to.be.equal(inputUsername);
      expect(result[0].ipList).to.be.length(2);
      expect(result[0].ipList[0].ip).to.be.equal('192.168.1.2');
      expect(result[0].ipList[1].ip).to.be.equal('192.168.1.4');
    });
  });

  suite(`Add new package`, () => {
    setup(() => {
      const inputModel = new PackageModel();
      inputModel.userId = testObj.identifierGenerator.generateId();
      inputModel.username = 'user1';
      inputModel.countIp = 2;
      inputModel.ipList = [
        { ip: '192.168.1.3', port: 8080 },
        { ip: '192.168.1.4', port: 8080 },
      ];
      inputModel.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

      testObj.inputModel = inputModel;
    });

    test(`Should error append user and ip`, async () => {
      const inputModel = testObj.inputModel;
      const commandError = new Error('Fail to append');
      fsAsync.appendFile.throws(commandError);

      const [error] = await testObj.packageFileRepository.add(inputModel);

      fsAsync.appendFile.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should successfully append user and ip`, async () => {
      const inputModel = testObj.inputModel;
      fsAsync.appendFile.onCall(0).resolves();
      fsAsync.appendFile.onCall(1).resolves();

      const [error, result] = await testObj.packageFileRepository.add(inputModel);

      fsAsync.appendFile.should.have.callCount(2);
      fsAsync.appendFile.firstCall.should.have.calledWith(
        sinon.match.string,
        sinon.match(`${inputModel.ipList[0].ip} ${inputModel.username}`),
      );
      fsAsync.appendFile.secondCall.should.have.calledWith(
        sinon.match.string,
        sinon.match(`${inputModel.ipList[1].ip} ${inputModel.username}`),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(PackageModel);
    });
  });

  suite(`Update package`, () => {
    test(`Should error update package when username not exist`, async () => {
      const inputModel = new PackageModel();

      const [error] = await testObj.packageFileRepository.update(inputModel);

      expect(error).to.be.an.instanceof(ModelUsernameNotExistException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', true);
    });

    test(`Should error update package when execute sed command`, async () => {
      const inputModel = new PackageModel();
      inputModel.username = 'user1';
      const commandError = new Error('Command error');
      childProcess.spawn.throws(commandError);

      const [error] = await testObj.packageFileRepository.update(inputModel);

      childProcess.spawn.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should error update package when execute sed command with stderr`, async () => {
      const inputModel = new PackageModel();
      inputModel.username = 'user1';
      childProcess.spawn.returns();
      childProcess.spawn.callsFake(() => {
        const stderr = new PassThrough();
        stderr.write('Command error');
        stderr.end();

        return { stderr };
      });

      const [error] = await testObj.packageFileRepository.update(inputModel);

      childProcess.spawn.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error.errorInfo).to.be.an.instanceof(Error);
    });

    test(`Should successfully update package (disable user)`, async () => {
      const inputModel = new PackageModel();
      inputModel.username = 'user1';
      inputModel.deleteDate = new Date();
      childProcess.spawn.returns();
      childProcess.spawn.callsFake(() => {
        const stderr = new PassThrough();
        stderr.end();

        return { stderr };
      });

      const [error] = await testObj.packageFileRepository.update(inputModel);

      childProcess.spawn.should.have.callCount(1);
      childProcess.spawn.should.have.calledWith(
        sinon.match.string,
        sinon.match.has('1', sinon.match(`s/^\\([^#]\\+ ${inputModel.username}\\)$/#\\1/g`)),
      );
      expect(error).to.be.a('null');
    });

    test(`Should successfully update package (enable user)`, async () => {
      const inputModel = new PackageModel();
      inputModel.username = 'user1';
      childProcess.spawn.returns();
      childProcess.spawn.callsFake(() => {
        const stderr = new PassThrough();
        stderr.end();

        return { stderr };
      });

      const [error] = await testObj.packageFileRepository.update(inputModel);

      childProcess.spawn.should.have.callCount(1);
      childProcess.spawn.should.have.calledWith(
        sinon.match.string,
        sinon.match.has('1', sinon.match(`s/^#\\(.\\+ ${inputModel.username}\\)$/\\1/g`)),
      );
      expect(error).to.be.a('null');
    });

    test(`Should successfully update package (remove expire user ip)`, async () => {
      const inputModel = new PackageModel();
      inputModel.username = 'user1';
      inputModel.ipList = [
        { ip: '192.168.1.1', port: 8080 },
        { ip: '192.168.1.2', port: 8080 },
      ];
      inputModel.expireDate = new Date();
      childProcess.spawn.returns();
      childProcess.spawn.callsFake(() => {
        const stderr = new PassThrough();
        stderr.end();

        return { stderr };
      });

      const [error] = await testObj.packageFileRepository.update(inputModel);

      childProcess.spawn.should.have.callCount(1);
      childProcess.spawn.should.have.calledWith(
        sinon.match.string,
        sinon.match.has(
          '1',
          sinon.match(
            `/^#\\?\\(192\\.168\\.1\\.1\\|192\\.168\\.1\\.2\\) ${inputModel.username}$/d`,
          ),
        ),
      );
      expect(error).to.be.a('null');
    });
  });
});
