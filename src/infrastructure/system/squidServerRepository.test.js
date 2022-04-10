/**
 * Created by pooya on 8/30/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const fsAsync = require('fs/promises');
const childProcess = require('child_process');
const { PassThrough } = require('stream');
const IpAddressModel = require('~src/core/model/ipAddressModel');
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

suite(`SquidServerRepository`, () => {
  suiteSetup(() => {
    sinon.stub(fsAsync, 'access');
    sinon.stub(fsAsync, 'mkdir');
    sinon.stub(fsAsync, 'writeFile');
    sinon.stub(childProcess, 'spawn');
  });

  suiteTeardown(() => {
    fsAsync.access.restore();
    fsAsync.mkdir.restore();
    fsAsync.writeFile.restore();
    childProcess.spawn.restore();
  });

  setup(() => {
    const { docker, container, squidServerRepository } = helper.fakeProxyFileServerPgRepository(2);

    testObj.docker = docker;
    testObj.container = container;
    testObj.squidServerRepository = squidServerRepository;

    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
  });

  teardown(() => {
    fsAsync.access.resetHistory();
    fsAsync.mkdir.resetHistory();
    fsAsync.writeFile.resetHistory();
    childProcess.spawn.resetHistory();
  });

  suite(`Reload all proxy`, () => {
    test(`Should error reload all proxy when get list of container`, async () => {
      const commandError = new Error('docker error');
      testObj.docker.listContainers.throws(commandError);

      const [error] = await testObj.squidServerRepository.reload();

      testObj.docker.listContainers.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should error reload all proxy when send kill to proxy container`, async () => {
      const containerOutputList = [{ Id: testObj.identifierGenerator.generateId() }];
      testObj.docker.listContainers.resolves(containerOutputList);
      testObj.docker.getContainer.returns(testObj.container);
      const commandError = new Error('docker error');
      testObj.container.kill.throws(commandError);

      const [error] = await testObj.squidServerRepository.reload();

      testObj.docker.listContainers.should.have.callCount(1);
      testObj.docker.getContainer.should.have.callCount(1);
      testObj.docker.getContainer.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.container.kill.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should successfully reload all proxy`, async () => {
      const containerOutputList = [{ Id: testObj.identifierGenerator.generateId() }];
      testObj.docker.listContainers.resolves(containerOutputList);
      testObj.docker.getContainer.returns(testObj.container);
      testObj.container.kill.resolves();

      const [error] = await testObj.squidServerRepository.reload();

      testObj.docker.listContainers.should.have.callCount(1);
      testObj.docker.getContainer.should.have.callCount(1);
      testObj.docker.getContainer.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.container.kill.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });

  suite(`Add proxy`, () => {
    setup(() => {
      const inputIpModel1 = new IpAddressModel();
      inputIpModel1.ip = '192.168.1.1';
      inputIpModel1.mask = 32;
      inputIpModel1.gateway = '192.168.1.6';
      inputIpModel1.interface = 'ens192';

      const inputIpModel2 = new IpAddressModel();
      inputIpModel2.ip = '192.168.1.2';
      inputIpModel2.mask = 32;
      inputIpModel2.gateway = '192.168.1.6';
      inputIpModel2.interface = 'ens192';

      const inputIpModel3 = new IpAddressModel();
      inputIpModel3.ip = '192.168.1.3';
      inputIpModel3.mask = 32;
      inputIpModel3.gateway = '192.168.1.6';
      inputIpModel3.interface = 'ens192';

      const inputIpModel4 = new IpAddressModel();
      inputIpModel4.ip = '192.168.1.4';
      inputIpModel4.mask = 32;
      inputIpModel4.gateway = '192.168.1.6';
      inputIpModel4.interface = 'ens192';

      testObj.inputIpModel1 = inputIpModel1;
      testObj.inputIpModel2 = inputIpModel2;
      testObj.inputIpModel3 = inputIpModel3;
      testObj.inputIpModel4 = inputIpModel4;
    });

    test(`Should error add new proxy when get list of container`, async () => {
      const inputModelList = [testObj.inputIpModel1];
      const commandError = new Error('docker error');
      testObj.docker.listContainers.throws(commandError);

      const [error] = await testObj.squidServerRepository.add(inputModelList);

      testObj.docker.listContainers.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should error add new proxy when remove proxy container`, async () => {
      const inputModelList = [testObj.inputIpModel1];
      const containerOutputList = [{ Id: testObj.identifierGenerator.generateId() }];
      testObj.docker.listContainers.resolves(containerOutputList);
      testObj.docker.getContainer.returns(testObj.container);
      const commandError = new Error('docker error');
      testObj.container.remove.throws(commandError);

      const [error] = await testObj.squidServerRepository.add(inputModelList);

      testObj.docker.listContainers.should.have.callCount(1);
      testObj.docker.getContainer.should.have.callCount(1);
      testObj.docker.getContainer.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.container.remove.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should error add new proxy when check exist container directory`, async () => {
      const inputModelList = [testObj.inputIpModel1];
      const containerOutputList = [{ Id: testObj.identifierGenerator.generateId() }];
      testObj.docker.listContainers.resolves(containerOutputList);
      testObj.docker.getContainer.returns(testObj.container);
      testObj.container.remove.resolves();
      const commandError = new Error('Command error');
      fsAsync.access.throws(commandError);

      const [error] = await testObj.squidServerRepository.add(inputModelList);

      testObj.docker.listContainers.should.have.callCount(1);
      testObj.docker.getContainer.should.have.callCount(1);
      testObj.docker.getContainer.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.container.remove.should.have.callCount(1);
      fsAsync.access.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should error add new proxy when create directory for container`, async () => {
      const inputModelList = [testObj.inputIpModel1];
      const containerOutputList = [{ Id: testObj.identifierGenerator.generateId() }];
      testObj.docker.listContainers.resolves(containerOutputList);
      testObj.docker.getContainer.returns(testObj.container);
      testObj.container.remove.resolves();
      const fileNotFoundError = new Error('File not found');
      fileNotFoundError.code = 'ENOENT';
      fsAsync.access.throws(fileNotFoundError);
      const commandError = new Error('Command error');
      fsAsync.mkdir.throws(commandError);

      const [error] = await testObj.squidServerRepository.add(inputModelList);

      testObj.docker.listContainers.should.have.callCount(1);
      testObj.docker.getContainer.should.have.callCount(1);
      testObj.docker.getContainer.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.container.remove.should.have.callCount(1);
      fsAsync.access.should.have.callCount(1);
      fsAsync.mkdir.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should error add new proxy when execute cp default file`, async () => {
      const inputModelList = [testObj.inputIpModel1];
      const containerOutputList = [{ Id: testObj.identifierGenerator.generateId() }];
      testObj.docker.listContainers.resolves(containerOutputList);
      testObj.docker.getContainer.returns(testObj.container);
      testObj.container.remove.resolves();
      const fileNotFoundError = new Error('File not found');
      fileNotFoundError.code = 'ENOENT';
      fsAsync.access.throws(fileNotFoundError);
      fsAsync.mkdir.resolves();
      const commandError = new Error('Command error');
      childProcess.spawn.throws(commandError);

      const [error] = await testObj.squidServerRepository.add(inputModelList);

      testObj.docker.listContainers.should.have.callCount(1);
      testObj.docker.getContainer.should.have.callCount(1);
      testObj.docker.getContainer.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.container.remove.should.have.callCount(1);
      fsAsync.access.should.have.callCount(2);
      fsAsync.mkdir.should.have.callCount(2);
      childProcess.spawn.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should error add new proxy when cp default file have error`, async () => {
      const inputModelList = [testObj.inputIpModel1];
      const containerOutputList = [{ Id: testObj.identifierGenerator.generateId() }];
      testObj.docker.listContainers.resolves(containerOutputList);
      testObj.docker.getContainer.returns(testObj.container);
      testObj.container.remove.resolves();
      const fileNotFoundError = new Error('File not found');
      fileNotFoundError.code = 'ENOENT';
      fsAsync.access.throws(fileNotFoundError);
      fsAsync.mkdir.resolves();
      childProcess.spawn.returns();
      childProcess.spawn.callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.write('Command error');
        stderr.end();

        return { stderr, stdin };
      });

      const [error] = await testObj.squidServerRepository.add(inputModelList);

      testObj.docker.listContainers.should.have.callCount(1);
      testObj.docker.getContainer.should.have.callCount(1);
      testObj.docker.getContainer.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.container.remove.should.have.callCount(1);
      fsAsync.access.should.have.callCount(2);
      fsAsync.mkdir.should.have.callCount(2);
      childProcess.spawn.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error.errorInfo).to.be.an.instanceof(Error);
    });

    test(`Should error add new proxy when overwrite config file`, async () => {
      const inputModelList = [testObj.inputIpModel1];
      const containerOutputList = [{ Id: testObj.identifierGenerator.generateId() }];
      testObj.docker.listContainers.resolves(containerOutputList);
      testObj.docker.getContainer.returns(testObj.container);
      testObj.container.remove.resolves();
      const fileNotFoundError = new Error('File not found');
      fileNotFoundError.code = 'ENOENT';
      fsAsync.access.throws(fileNotFoundError);
      fsAsync.mkdir.resolves();
      childProcess.spawn.returns();
      childProcess.spawn.callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.end();

        return { stderr, stdin };
      });
      const commandError = new Error('Command error');
      fsAsync.writeFile.throws(commandError);

      const [error] = await testObj.squidServerRepository.add(inputModelList);

      testObj.docker.listContainers.should.have.callCount(1);
      testObj.docker.getContainer.should.have.callCount(1);
      testObj.docker.getContainer.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.container.remove.should.have.callCount(1);
      fsAsync.access.should.have.callCount(2);
      fsAsync.mkdir.should.have.callCount(2);
      childProcess.spawn.should.have.callCount(1);
      fsAsync.writeFile.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should error add new proxy when create container`, async () => {
      const inputModelList = [testObj.inputIpModel1];
      const containerOutputList = [{ Id: testObj.identifierGenerator.generateId() }];
      testObj.docker.listContainers.resolves(containerOutputList);
      testObj.docker.getContainer.returns(testObj.container);
      testObj.container.remove.resolves();
      const fileNotFoundError = new Error('File not found');
      fileNotFoundError.code = 'ENOENT';
      fsAsync.access.throws(fileNotFoundError);
      fsAsync.mkdir.resolves();
      childProcess.spawn.returns();
      childProcess.spawn.callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.end();

        return { stderr, stdin };
      });
      fsAsync.writeFile.resolves();
      const commandError = new Error('Command error');
      testObj.docker.createContainer.throws(commandError);

      const [error] = await testObj.squidServerRepository.add(inputModelList);

      testObj.docker.listContainers.should.have.callCount(1);
      testObj.docker.getContainer.should.have.callCount(1);
      testObj.docker.getContainer.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.container.remove.should.have.callCount(1);
      fsAsync.access.should.have.callCount(2);
      fsAsync.mkdir.should.have.callCount(2);
      childProcess.spawn.should.have.callCount(1);
      fsAsync.writeFile.should.have.callCount(1);
      testObj.docker.createContainer.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should error add new proxy when start container`, async () => {
      const inputModelList = [testObj.inputIpModel1];
      const containerOutputList = [{ Id: testObj.identifierGenerator.generateId() }];
      testObj.docker.listContainers.resolves(containerOutputList);
      testObj.docker.getContainer.returns(testObj.container);
      testObj.container.remove.resolves();
      const fileNotFoundError = new Error('File not found');
      fileNotFoundError.code = 'ENOENT';
      fsAsync.access.throws(fileNotFoundError);
      fsAsync.mkdir.resolves();
      childProcess.spawn.returns();
      childProcess.spawn.callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.end();

        return { stderr, stdin };
      });
      fsAsync.writeFile.resolves();
      testObj.docker.createContainer.resolves(testObj.container);
      const commandError = new Error('Command error');
      testObj.container.start.throws(commandError);

      const [error] = await testObj.squidServerRepository.add(inputModelList);

      testObj.docker.listContainers.should.have.callCount(1);
      testObj.docker.getContainer.should.have.callCount(1);
      testObj.docker.getContainer.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.container.remove.should.have.callCount(1);
      fsAsync.access.should.have.callCount(2);
      fsAsync.mkdir.should.have.callCount(2);
      childProcess.spawn.should.have.callCount(1);
      fsAsync.writeFile.should.have.callCount(1);
      testObj.docker.createContainer.should.have.callCount(1);
      testObj.container.start.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should successfully add new proxy when start container`, async () => {
      const inputModelList = [testObj.inputIpModel1];
      const containerOutputList = [{ Id: testObj.identifierGenerator.generateId() }];
      testObj.docker.listContainers.resolves(containerOutputList);
      testObj.docker.getContainer.returns(testObj.container);
      testObj.container.remove.resolves();
      const fileNotFoundError = new Error('File not found');
      fileNotFoundError.code = 'ENOENT';
      fsAsync.access.throws(fileNotFoundError);
      fsAsync.mkdir.resolves();
      childProcess.spawn.returns();
      childProcess.spawn.callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.end();

        return { stderr, stdin };
      });
      fsAsync.writeFile.resolves();
      testObj.docker.createContainer.resolves(testObj.container);
      testObj.container.start.resolves();

      const [error, result] = await testObj.squidServerRepository.add(inputModelList);

      testObj.docker.listContainers.should.have.callCount(1);
      testObj.docker.getContainer.should.have.callCount(1);
      testObj.docker.getContainer.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.container.remove.should.have.callCount(1);
      fsAsync.access.should.have.callCount(2);
      fsAsync.mkdir.should.have.callCount(2);
      childProcess.spawn.should.have.callCount(1);
      fsAsync.writeFile.should.have.callCount(1);
      testObj.docker.createContainer.should.have.callCount(1);
      testObj.container.start.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.an.instanceof(IpAddressModel);
    });
  });
});
