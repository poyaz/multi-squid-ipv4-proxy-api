/**
 * Created by pooya on 9/4/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const IpAddressModel = require('~src/core/model/ipAddressModel');
const JobModel = require('~src/core/model/jobModel');
const UnknownException = require('~src/core/exception/unknownException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`ProxyServerRegenerateJobService`, () => {
  setup(() => {
    const {
      jobRepository,
      proxyServerRepository,
      proxyServerFileRepository,
      proxyServerRegenerateJobService,
    } = helper.fakeProxyRegenerateServerJobService();

    testObj.jobRepository = jobRepository;
    testObj.proxyServerRepository = proxyServerRepository;
    testObj.proxyServerFileRepository = proxyServerFileRepository;
    testObj.proxyServerRegenerateJobService = proxyServerRegenerateJobService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
  });

  suite(`Create new job`, () => {
    setup(() => {
      const inputModel = new JobModel();
      inputModel.data = `192.168.1.0/29`;
      inputModel.status = JobModel.STATUS_PENDING;
      inputModel.totalRecord = 5;

      testObj.inputModel = inputModel;

      testObj.nextTickStub = sinon
        .stub(process, 'nextTick')
        .callsFake((fn, ...args) => fn(...args));
    });

    teardown(() => {
      testObj.nextTickStub.restore();
    });

    test(`Should error add new job when fetch ip list`, async () => {
      const inputModel = testObj.inputModel;
      testObj.jobRepository.add.resolves([new UnknownException()]);

      const [error] = await testObj.proxyServerRegenerateJobService.add(inputModel);

      testObj.jobRepository.add.should.have.callCount(1);
      testObj.jobRepository.add.should.have.calledWith(
        sinon.match.instanceOf(JobModel).and(sinon.match.has('status', JobModel.STATUS_PROCESSING)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error add new job when fetch ip list`, async () => {
      const inputModel = testObj.inputModel;
      const outputModel = testObj.inputModel.clone();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.status = JobModel.STATUS_PROCESSING;
      testObj.jobRepository.add.resolves([null, outputModel]);
      testObj.proxyServerRegenerateJobService.execute = sinon.stub();

      const [error, result] = await testObj.proxyServerRegenerateJobService.add(inputModel);

      testObj.jobRepository.add.should.have.callCount(1);
      testObj.jobRepository.add.should.have.calledWith(
        sinon.match.instanceOf(JobModel).and(sinon.match.has('status', JobModel.STATUS_PROCESSING)),
      );
      testObj.proxyServerRegenerateJobService.execute.should.have.callCount(1);
      testObj.proxyServerRegenerateJobService.execute.should.have.calledWith(
        sinon.match
          .instanceOf(JobModel)
          .and(sinon.match.has('id', testObj.identifierGenerator.generateId())),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(JobModel).and.have.include({
        id: testObj.identifierGenerator.generateId(),
        status: JobModel.STATUS_PROCESSING,
      });
    });
  });

  suite(`Execute job`, () => {
    setup(() => {
      const inputModel = new JobModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.data = `192.168.1.0/29`;
      inputModel.status = JobModel.STATUS_PENDING;
      inputModel.totalRecord = 5;

      testObj.consoleError = sinon.stub(console, 'error');
    });

    teardown(() => {
      testObj.consoleError.restore();
    });

    test(`Should error execute job when fetch all ip list and successfully update job status`, async () => {
      const inputModel = testObj.inputModel;
      testObj.proxyServerRepository.getAll.resolves([new UnknownException()]);
      testObj.jobRepository.update.resolves([null]);

      await testObj.proxyServerRegenerateJobService.execute(inputModel);

      testObj.proxyServerRepository.getAll.should.have.callCount(1);
      testObj.jobRepository.update.should.have.callCount(1);
      testObj.jobRepository.update.should.have.calledWith(
        sinon.match.instanceOf(JobModel).and(sinon.match.has('status', JobModel.STATUS_FAIL)),
      );
    });

    test(`Should error execute job when create config file and successfully update job status`, async () => {
      const inputModel = testObj.inputModel;
      const outputIpModelList = [
        testObj.outputIpModel1,
        testObj.outputIpModel2,
        testObj.outputIpModel3,
        testObj.outputIpModel4,
        testObj.outputIpModel5,
      ];
      testObj.proxyServerRepository.getAll.resolves([null, outputIpModelList]);
      testObj.proxyServerFileRepository.add.resolves([new UnknownException()]);
      testObj.jobRepository.update.resolves([null]);

      await testObj.proxyServerRegenerateJobService.execute(inputModel);

      testObj.proxyServerRepository.getAll.should.have.callCount(1);
      testObj.proxyServerFileRepository.add.should.have.callCount(1);
      testObj.jobRepository.update.should.have.callCount(1);
      testObj.jobRepository.update.should.have.calledWith(
        sinon.match.instanceOf(JobModel).and(sinon.match.has('status', JobModel.STATUS_FAIL)),
      );
    });

    test(`Should successfully execute job and successfully update job status`, async () => {
      const inputModel = testObj.inputModel;
      const outputIpModelList = [
        testObj.outputIpModel1,
        testObj.outputIpModel2,
        testObj.outputIpModel3,
        testObj.outputIpModel4,
        testObj.outputIpModel5,
      ];
      testObj.proxyServerRepository.getAll.resolves([null, outputIpModelList]);
      testObj.proxyServerFileRepository.add.resolves([null]);
      testObj.jobRepository.update.resolves([null]);

      await testObj.proxyServerRegenerateJobService.execute(inputModel);

      testObj.proxyServerRepository.getAll.should.have.callCount(1);
      testObj.proxyServerFileRepository.add.should.have.callCount(1);
      testObj.jobRepository.update.should.have.callCount(1);
      testObj.jobRepository.update.should.have.calledWith(
        sinon.match.instanceOf(JobModel).and(sinon.match.has('status', JobModel.STATUS_SUCCESS)),
      );
    });
  });
});
