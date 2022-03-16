/**
 * Created by pooya on 8/30/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const os = require('os');
const networkInterfaces = sinon.stub(os, 'networkInterfaces');

const helper = require('~src/helper');

const IpAddressModel = require('~src/core/model/ipAddressModel');
const JobModel = require('~src/core/model/jobModel');
const UnknownException = require('~src/core/exception/unknownException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`ProxyServerJobService`, () => {
  setup(() => {
    const {
      jobRepository,
      proxyServerRepository,
      proxyServerFileRepository,
      ipAddrRepository,
      proxyServerJobService,
    } = helper.fakeProxyServerJobService();

    testObj.jobRepository = jobRepository;
    testObj.proxyServerRepository = proxyServerRepository;
    testObj.proxyServerFileRepository = proxyServerFileRepository;
    testObj.ipAddrRepository = ipAddrRepository;
    testObj.proxyServerJobService = proxyServerJobService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.networkInterfaces = networkInterfaces;
  });

  teardown(() => {
    testObj.networkInterfaces.restore();
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

      const [error] = await testObj.proxyServerJobService.add(inputModel);

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
      testObj.proxyServerJobService.execute = sinon.stub();

      const [error, result] = await testObj.proxyServerJobService.add(inputModel);

      testObj.jobRepository.add.should.have.callCount(1);
      testObj.jobRepository.add.should.have.calledWith(
        sinon.match.instanceOf(JobModel).and(sinon.match.has('status', JobModel.STATUS_PROCESSING)),
      );
      testObj.proxyServerJobService.execute.should.have.callCount(1);
      testObj.proxyServerJobService.execute.should.have.calledWith(
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

      const outputIpModel1 = new IpAddressModel();
      outputIpModel1.ip = '192.168.1.1';
      outputIpModel1.mask = 32;
      outputIpModel1.gateway = '192.168.1.6';
      outputIpModel1.interface = 'ens192';

      const outputIpModel2 = new IpAddressModel();
      outputIpModel2.ip = '192.168.1.2';
      outputIpModel2.mask = 32;
      outputIpModel2.gateway = '192.168.1.6';
      outputIpModel2.interface = 'ens192';

      const outputIpModel3 = new IpAddressModel();
      outputIpModel3.ip = '192.168.1.3';
      outputIpModel3.mask = 32;
      outputIpModel3.gateway = '192.168.1.6';
      outputIpModel3.interface = 'ens192';

      const outputIpModel4 = new IpAddressModel();
      outputIpModel4.ip = '192.168.1.4';
      outputIpModel4.mask = 32;
      outputIpModel4.gateway = '192.168.1.6';
      outputIpModel4.interface = 'ens192';

      const outputIpModel5 = new IpAddressModel();
      outputIpModel5.ip = '192.168.1.5';
      outputIpModel5.mask = 32;
      outputIpModel5.gateway = '192.168.1.6';
      outputIpModel5.interface = 'ens192';

      const outputIpModel6 = new IpAddressModel();
      outputIpModel6.ip = '192.168.11.5';
      outputIpModel6.mask = 32;
      outputIpModel6.gateway = '192.168.11.6';
      outputIpModel6.interface = 'ens192';

      testObj.inputModel = inputModel;
      testObj.outputIpModel1 = outputIpModel1;
      testObj.outputIpModel2 = outputIpModel2;
      testObj.outputIpModel3 = outputIpModel3;
      testObj.outputIpModel4 = outputIpModel4;
      testObj.outputIpModel5 = outputIpModel5;
      testObj.outputIpModel6 = outputIpModel6;

      testObj.consoleError = sinon.stub(console, 'error');

      testObj.networkInterfaces.returns({
        ens192: [
          { address: '192.168.1.1' },
          { address: '192.168.1.2' },
          { address: '192.168.1.3' },
          { address: '192.168.1.4' },
          { address: '192.168.1.5' },
        ],
      });
    });

    teardown(() => {
      testObj.consoleError.restore();
    });

    test(`Should error execute job when fetch ip mask list and successfully update job status`, async () => {
      const inputModel = testObj.inputModel;
      testObj.proxyServerRepository.getByIpMask.resolves([new UnknownException()]);
      testObj.jobRepository.update.resolves([null]);

      await testObj.proxyServerJobService.execute(inputModel);

      testObj.proxyServerRepository.getByIpMask.should.have.callCount(1);
      testObj.jobRepository.update.should.have.callCount(1);
      testObj.jobRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(JobModel)
          .and(sinon.match.has('status', JobModel.STATUS_FAIL))
          .and(sinon.match.has('totalRecordAdd', 0))
          .and(sinon.match.has('totalRecordExist', 0))
          .and(sinon.match.has('totalRecordError', 5)),
      );
      testObj.consoleError.should.have.callCount(1);
    });

    test(`Should error execute job and when fetch ip mask list and error update job status`, async () => {
      const inputModel = testObj.inputModel;
      testObj.proxyServerRepository.getByIpMask.resolves([new UnknownException()]);
      testObj.jobRepository.update.resolves([new UnknownException()]);

      await testObj.proxyServerJobService.execute(inputModel);

      testObj.proxyServerRepository.getByIpMask.should.have.callCount(1);
      testObj.jobRepository.update.should.have.callCount(1);
      testObj.jobRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(JobModel)
          .and(sinon.match.has('status', JobModel.STATUS_FAIL))
          .and(sinon.match.has('totalRecordAdd', 0))
          .and(sinon.match.has('totalRecordExist', 0))
          .and(sinon.match.has('totalRecordError', 5)),
      );
      testObj.consoleError.should.have.callCount(2);
    });

    test(`Should error execute job when add ip in operation system (all ip fail) and successfully update job status`, async () => {
      const inputModel = testObj.inputModel;
      const outputIpModelList = [
        testObj.outputIpModel1,
        testObj.outputIpModel2,
        testObj.outputIpModel3,
        testObj.outputIpModel4,
        testObj.outputIpModel5,
      ];
      testObj.proxyServerRepository.getByIpMask.resolves([null, outputIpModelList]);
      testObj.ipAddrRepository.add.resolves([new UnknownException()]);
      testObj.jobRepository.update.resolves([null]);

      await testObj.proxyServerJobService.execute(inputModel);

      testObj.proxyServerRepository.getByIpMask.should.have.callCount(1);
      testObj.ipAddrRepository.add.should.have.callCount(5);
      testObj.ipAddrRepository.add.should.have.calledWith(sinon.match.hasNested('0.mask', 29));
      testObj.jobRepository.update.should.have.callCount(1);
      testObj.jobRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(JobModel)
          .and(sinon.match.has('status', JobModel.STATUS_FAIL))
          .and(sinon.match.has('totalRecordAdd', 0))
          .and(sinon.match.has('totalRecordExist', 0))
          .and(sinon.match.has('totalRecordError', 5)),
      );
    });

    test(`Should error execute job when add ip in operation system (two ip fail) and successfully update job status`, async () => {
      const inputModel = testObj.inputModel;
      const outputIpModelList = [
        testObj.outputIpModel1,
        testObj.outputIpModel2,
        testObj.outputIpModel3,
        testObj.outputIpModel4,
        testObj.outputIpModel5,
      ];
      testObj.proxyServerRepository.getByIpMask.resolves([null, outputIpModelList]);
      testObj.ipAddrRepository.add.onCall(0).resolves([null, []]);
      testObj.ipAddrRepository.add.onCall(1).resolves([new UnknownException()]);
      testObj.ipAddrRepository.add.onCall(2).resolves([null, [testObj.outputIpModel2]]);
      testObj.ipAddrRepository.add.onCall(3).resolves([new UnknownException()]);
      testObj.ipAddrRepository.add.onCall(4).resolves([null, []]);
      testObj.jobRepository.update.resolves([null]);

      await testObj.proxyServerJobService.execute(inputModel);

      testObj.proxyServerRepository.getByIpMask.should.have.callCount(1);
      testObj.ipAddrRepository.add.should.have.callCount(5);
      testObj.ipAddrRepository.add.should.have.calledWith(sinon.match.hasNested('0.mask', 29));
      testObj.jobRepository.update.should.have.callCount(1);
      testObj.jobRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(JobModel)
          .and(sinon.match.has('status', JobModel.STATUS_FAIL))
          .and(sinon.match.has('totalRecordAdd', 1))
          .and(sinon.match.has('totalRecordExist', 2))
          .and(sinon.match.has('totalRecordError', 2)),
      );
    });

    test(`Should error execute job when active ip range mask list and successfully update job status`, async () => {
      const inputModel = testObj.inputModel;
      const outputIpModelList = [
        testObj.outputIpModel1,
        testObj.outputIpModel2,
        testObj.outputIpModel3,
        testObj.outputIpModel4,
        testObj.outputIpModel5,
      ];
      testObj.proxyServerRepository.getByIpMask.resolves([null, outputIpModelList]);
      testObj.ipAddrRepository.add.resolves([null, []]);
      testObj.proxyServerRepository.activeIpMask.resolves([new UnknownException()]);
      testObj.jobRepository.update.resolves([null]);

      await testObj.proxyServerJobService.execute(inputModel);

      testObj.proxyServerRepository.getByIpMask.should.have.callCount(1);
      testObj.ipAddrRepository.add.should.have.callCount(5);
      testObj.ipAddrRepository.add.should.have.calledWith(sinon.match.hasNested('0.mask', 29));
      testObj.proxyServerRepository.activeIpMask.should.have.callCount(1);
      testObj.jobRepository.update.should.have.callCount(1);
      testObj.jobRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(JobModel)
          .and(sinon.match.has('status', JobModel.STATUS_FAIL))
          .and(sinon.match.has('totalRecordAdd', 0))
          .and(sinon.match.has('totalRecordExist', 5))
          .and(sinon.match.has('totalRecordError', 0)),
      );
    });

    test(`Should error execute job when fetch all ip list and successfully update job status`, async () => {
      const inputModel = testObj.inputModel;
      const outputIpModelList = [
        testObj.outputIpModel1,
        testObj.outputIpModel2,
        testObj.outputIpModel3,
        testObj.outputIpModel4,
        testObj.outputIpModel5,
      ];
      testObj.proxyServerRepository.getByIpMask.resolves([null, outputIpModelList]);
      testObj.ipAddrRepository.add.resolves([null, []]);
      testObj.proxyServerRepository.activeIpMask.resolves([null]);
      testObj.proxyServerRepository.getAll.resolves([new UnknownException()]);
      testObj.jobRepository.update.resolves([null]);

      await testObj.proxyServerJobService.execute(inputModel);

      testObj.proxyServerRepository.getByIpMask.should.have.callCount(1);
      testObj.ipAddrRepository.add.should.have.callCount(5);
      testObj.ipAddrRepository.add.should.have.calledWith(sinon.match.hasNested('0.mask', 29));
      testObj.proxyServerRepository.activeIpMask.should.have.callCount(1);
      testObj.proxyServerRepository.getAll.should.have.callCount(1);
      testObj.jobRepository.update.should.have.callCount(1);
      testObj.jobRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(JobModel)
          .and(sinon.match.has('status', JobModel.STATUS_FAIL))
          .and(sinon.match.has('totalRecordAdd', 0))
          .and(sinon.match.has('totalRecordExist', 5))
          .and(sinon.match.has('totalRecordError', 0)),
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
      testObj.proxyServerRepository.getByIpMask.resolves([null, outputIpModelList]);
      testObj.ipAddrRepository.add.resolves([null, []]);
      testObj.proxyServerRepository.activeIpMask.resolves([null]);
      testObj.proxyServerRepository.getAll.resolves([null, outputIpModelList]);
      testObj.proxyServerFileRepository.add.resolves([new UnknownException()]);
      testObj.jobRepository.update.resolves([null]);

      await testObj.proxyServerJobService.execute(inputModel);

      testObj.proxyServerRepository.getByIpMask.should.have.callCount(1);
      testObj.ipAddrRepository.add.should.have.callCount(5);
      testObj.ipAddrRepository.add.should.have.calledWith(sinon.match.hasNested('0.mask', 29));
      testObj.proxyServerRepository.activeIpMask.should.have.callCount(1);
      testObj.proxyServerRepository.getAll.should.have.callCount(1);
      testObj.proxyServerFileRepository.add.should.have.callCount(1);
      testObj.jobRepository.update.should.have.callCount(1);
      testObj.jobRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(JobModel)
          .and(sinon.match.has('status', JobModel.STATUS_FAIL))
          .and(sinon.match.has('totalRecordAdd', 0))
          .and(sinon.match.has('totalRecordExist', 5))
          .and(sinon.match.has('totalRecordError', 0)),
      );
    });

    test(`Should successfully execute job and successfully update job status`, async () => {
      const inputModel = testObj.inputModel;
      const outputGetByIpMask = [
        testObj.outputIpModel1,
        testObj.outputIpModel2,
        testObj.outputIpModel3,
        testObj.outputIpModel4,
        testObj.outputIpModel5,
      ];
      testObj.proxyServerRepository.getByIpMask.resolves([null, outputGetByIpMask]);
      testObj.ipAddrRepository.add.resolves([null, []]);
      testObj.proxyServerRepository.activeIpMask.resolves([null]);
      const outputIpModelList = [
        testObj.outputIpModel1,
        testObj.outputIpModel2,
        testObj.outputIpModel3,
        testObj.outputIpModel4,
        testObj.outputIpModel5,
        testObj.outputIpModel6,
      ];
      testObj.proxyServerRepository.getAll.resolves([null, outputIpModelList]);
      testObj.proxyServerFileRepository.add.resolves([null]);
      testObj.jobRepository.update.resolves([null]);

      await testObj.proxyServerJobService.execute(inputModel);

      testObj.proxyServerRepository.getByIpMask.should.have.callCount(1);
      testObj.ipAddrRepository.add.should.have.callCount(5);
      testObj.ipAddrRepository.add.should.have.calledWith(sinon.match.hasNested('0.mask', 29));
      testObj.proxyServerRepository.activeIpMask.should.have.callCount(1);
      testObj.proxyServerRepository.getAll.should.have.callCount(1);
      testObj.proxyServerFileRepository.add.should.have.callCount(1);
      testObj.proxyServerFileRepository.add.should.have.calledWith(sinon.match.has('length', 5));
      testObj.jobRepository.update.should.have.callCount(1);
      testObj.jobRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(JobModel)
          .and(sinon.match.has('status', JobModel.STATUS_SUCCESS))
          .and(sinon.match.has('totalRecordAdd', 0))
          .and(sinon.match.has('totalRecordExist', 5))
          .and(sinon.match.has('totalRecordError', 0)),
      );
    });
  });
});
