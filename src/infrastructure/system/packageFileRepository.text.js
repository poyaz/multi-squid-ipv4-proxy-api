/**
 * Created by pooya on 8/26/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const fsAsync = require('fs/promises');
const PackageModel = require('~src/core/model/packageModel');
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

suite(`PackageFileRepository`, () => {
  suiteSetup(() => {
    sinon.stub(fsAsync, 'appendFile');
  });

  suiteTeardown(() => {
    fsAsync.appendFile.restore();
  });

  setup(() => {
    const { packageFileRepository } = helper.fakePackageFileRepository();

    testObj.packageFileRepository = packageFileRepository;

    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
  });

  teardown(() => {
    fsAsync.appendFile.resetHistory();
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
});
