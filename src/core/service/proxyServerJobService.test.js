/**
 * Created by pooya on 8/30/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const IpAddressModel = require('~src/core/model/ipAddressModel');
const JobModel = require('~src/core/model/jobModel');
const UnknownException = require('~src/core/exception/unknownException');
const NotFoundException = require('~src/core/exception/notFoundException');
const ExpireDateException = require('~src/core/exception/expireDateException');
const DisableUserException = require('~src/core/exception/disableUserException');

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
  });

  suite(`Create new job`, () => {
    setup(() => {
      const inputModel = new JobModel();
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
      outputIpModel6.ip = '192.168.1.6';
      outputIpModel6.mask = 32;
      outputIpModel6.gateway = '192.168.1.6';
      outputIpModel6.interface = 'ens192';

      testObj.inputModel = inputModel;
      testObj.outputIpModel1 = outputIpModel1;
      testObj.outputIpModel2 = outputIpModel2;
      testObj.outputIpModel3 = outputIpModel3;
      testObj.outputIpModel4 = outputIpModel4;
      testObj.outputIpModel5 = outputIpModel5;
      testObj.outputIpModel6 = outputIpModel6;

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
});
