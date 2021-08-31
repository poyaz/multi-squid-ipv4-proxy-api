/**
 * Created by pooya on 8/31/21.
 */

/**
 * Created by pooya on 8/24/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

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

suite(`IpAddrRepository`, () => {
  suiteSetup(() => {
    sinon.stub(childProcess, 'spawn');
  });

  suiteTeardown(() => {
    childProcess.spawn.restore();
  });

  setup(() => {
    const { ipAddrRepository } = helper.fakeIpAddrRepository();

    testObj.ipAddrRepository = ipAddrRepository;

    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
  });

  teardown(() => {
    childProcess.spawn.resetHistory();
  });

  suite(`Add new ip`, () => {
    setup(() => {
      const inputIpModel1 = new IpAddressModel();
      inputIpModel1.ip = '192.168.1.1';
      inputIpModel1.mask = 32;
      inputIpModel1.gateway = '192.168.1.6';
      inputIpModel1.interface = 'ens192';

      testObj.inputIpModel1 = inputIpModel1;
    });

    test(`Should error add new ip when execute find ip addr`, async () => {
      const inputModel = [testObj.inputIpModel1];
      const commandError = new Error('Command error');
      childProcess.spawn.throws(commandError);

      const [error] = await testObj.ipAddrRepository.add(inputModel);

      childProcess.spawn.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should error add new ip when stderr in execute find ip addr`, async () => {
      const inputModel = [testObj.inputIpModel1];
      childProcess.spawn.returns();
      childProcess.spawn.callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.write('Command error');
        stderr.end();

        return { stderr, stdin };
      });

      const [error] = await testObj.ipAddrRepository.add(inputModel);

      childProcess.spawn.should.have.callCount(1);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error.errorInfo).to.be.an.instanceof(Error);
    });

    test(`Should error add new ip when execute add ip addr`, async () => {
      const inputModel = [testObj.inputIpModel1];
      childProcess.spawn.onCall(0).returns();
      childProcess.spawn.onCall(0).callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.end();

        const stdout = new PassThrough();
        stdout.write('0\n');
        stdout.end();

        return { stderr, stdin, stdout };
      });
      const commandError = new Error('Command error');
      childProcess.spawn.onCall(1).throws(commandError);

      const [error] = await testObj.ipAddrRepository.add(inputModel);

      childProcess.spawn.should.have.callCount(2);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', commandError);
    });

    test(`Should error add new ip when stderr in execute add ip addr`, async () => {
      const inputModel = [testObj.inputIpModel1];
      childProcess.spawn.onCall(0).returns();
      childProcess.spawn.onCall(0).callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.end();

        const stdout = new PassThrough();
        stdout.write('0\n');
        stdout.end();

        return { stderr, stdin, stdout };
      });
      childProcess.spawn.onCall(1).returns();
      childProcess.spawn.onCall(1).callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.write('Command error');
        stderr.end();

        return { stderr, stdin };
      });

      const [error] = await testObj.ipAddrRepository.add(inputModel);

      childProcess.spawn.should.have.callCount(2);
      expect(error).to.be.an.instanceof(CommandExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error.errorInfo).to.be.an.instanceof(Error);
    });

    test(`Should successfully skip new ip (when ip exist)`, async () => {
      const inputModel = [testObj.inputIpModel1];
      childProcess.spawn.onCall(0).returns();
      childProcess.spawn.onCall(0).callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.end();

        const stdout = new PassThrough();
        stdout.write('1\n');
        stdout.end();

        return { stderr, stdin, stdout };
      });
      childProcess.spawn.onCall(1).returns();
      childProcess.spawn.onCall(1).callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.end();

        return { stderr, stdin };
      });

      const [error, result] = await testObj.ipAddrRepository.add(inputModel);

      childProcess.spawn.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should successfully add new ip (when ip not exist)`, async () => {
      const inputModel = [testObj.inputIpModel1];
      childProcess.spawn.onCall(0).returns();
      childProcess.spawn.onCall(0).callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.end();

        const stdout = new PassThrough();
        stdout.write('0\n');
        stdout.end();

        return { stderr, stdin, stdout };
      });
      childProcess.spawn.onCall(1).returns();
      childProcess.spawn.onCall(1).callsFake(() => {
        const stdin = new PassThrough();

        const stderr = new PassThrough();
        stderr.end();

        return { stderr, stdin };
      });

      const [error, result] = await testObj.ipAddrRepository.add(inputModel);

      childProcess.spawn.should.have.callCount(2);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.an.instanceof(IpAddressModel);
    });
  });
});
