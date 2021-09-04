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

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`ProxyServerService`, () => {
  setup(() => {
    const {
      proxyServerRepository,
      proxyServerJobService,
      proxySquidRepository,
      proxyServerRegenerateJobService,
      proxyServerService,
    } = helper.fakeProxyServerService();

    testObj.proxyServerRepository = proxyServerRepository;
    testObj.proxyServerJobService = proxyServerJobService;
    testObj.proxySquidRepository = proxySquidRepository;
    testObj.proxyServerRegenerateJobService = proxyServerRegenerateJobService;
    testObj.proxyServerService = proxyServerService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
  });

  suite(`Get all proxy ip`, () => {
    test(`Should error get all proxy ip`, async () => {
      testObj.proxyServerRepository.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.proxyServerService.getAll();

      testObj.proxyServerRepository.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error get all proxy ip`, async () => {
      const outputModel1 = new IpAddressModel();
      const outputModel2 = new IpAddressModel();
      testObj.proxyServerRepository.getAll.resolves([null, [outputModel1, outputModel2]]);

      const [error, result] = await testObj.proxyServerService.getAll();

      testObj.proxyServerRepository.getAll.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.length(2);
      expect(result[0]).to.be.an.instanceof(IpAddressModel);
      expect(result[1]).to.be.an.instanceof(IpAddressModel);
    });
  });

  suite(`Generate ip address`, () => {
    setup(() => {
      const inputModel = new IpAddressModel();
      inputModel.ip = '192.168.1.0';
      inputModel.mask = 29;
      inputModel.gateway = '192.168.1.6';
      inputModel.interface = 'ens192';

      const outputModel1 = new IpAddressModel();
      outputModel1.ip = '192.168.1.1';
      outputModel1.mask = 32;
      outputModel1.gateway = '192.168.1.6';
      outputModel1.interface = 'ens192';

      const outputModel2 = new IpAddressModel();
      outputModel2.ip = '192.168.1.2';
      outputModel2.mask = 32;
      outputModel2.gateway = '192.168.1.6';
      outputModel2.interface = 'ens192';

      const outputModel3 = new IpAddressModel();
      outputModel3.ip = '192.168.1.3';
      outputModel3.mask = 32;
      outputModel3.gateway = '192.168.1.6';
      outputModel3.interface = 'ens192';

      const outputModel4 = new IpAddressModel();
      outputModel4.ip = '192.168.1.4';
      outputModel4.mask = 32;
      outputModel4.gateway = '192.168.1.6';
      outputModel4.interface = 'ens192';

      const outputModel5 = new IpAddressModel();
      outputModel5.ip = '192.168.1.5';
      outputModel5.mask = 32;
      outputModel5.gateway = '192.168.1.6';
      outputModel5.interface = 'ens192';

      const outputModel6 = new IpAddressModel();
      outputModel6.ip = '192.168.1.6';
      outputModel6.mask = 32;
      outputModel6.gateway = '192.168.1.6';
      outputModel6.interface = 'ens192';

      testObj.inputModel = inputModel;
      testObj.outputModel1 = outputModel1;
      testObj.outputModel2 = outputModel2;
      testObj.outputModel3 = outputModel3;
      testObj.outputModel4 = outputModel4;
      testObj.outputModel5 = outputModel5;
      testObj.outputModel6 = outputModel6;
    });

    test(`Should error generate ip address when add ip range`, async () => {
      const inputModel = testObj.inputModel;
      testObj.proxyServerRepository.add.resolves([new UnknownException()]);

      const [error] = await testObj.proxyServerService.add(inputModel);

      testObj.proxyServerRepository.add.should.have.callCount(1);
      testObj.proxyServerRepository.add.should.have.calledWith(
        sinon.match.array.and(sinon.match.has('length', 5)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error generate ip address when add job`, async () => {
      const inputModel = testObj.inputModel;
      const outputIpModel = [
        testObj.outputModel1,
        testObj.outputModel2,
        testObj.outputModel3,
        testObj.outputModel4,
        testObj.outputModel5,
        testObj.outputModel6,
      ];
      testObj.proxyServerRepository.add.resolves([null, outputIpModel]);
      testObj.proxyServerJobService.add.resolves([new UnknownException()]);

      const [error] = await testObj.proxyServerService.add(inputModel);

      testObj.proxyServerRepository.add.should.have.callCount(1);
      testObj.proxyServerRepository.add.should.have.calledWith(
        sinon.match.array.and(sinon.match.has('length', 5)),
      );
      testObj.proxyServerJobService.add.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully generate ip address`, async () => {
      const inputModel = testObj.inputModel;
      const outputIpModel = [
        testObj.outputModel1,
        testObj.outputModel2,
        testObj.outputModel3,
        testObj.outputModel4,
        testObj.outputModel5,
        testObj.outputModel6,
      ];
      testObj.proxyServerRepository.add.resolves([null, outputIpModel]);
      const outputJobModel = new JobModel();
      outputJobModel.id = testObj.identifierGenerator.generateId();
      testObj.proxyServerJobService.add.resolves([null, outputJobModel]);

      const [error, result] = await testObj.proxyServerService.add(inputModel);

      testObj.proxyServerRepository.add.should.have.callCount(1);
      testObj.proxyServerRepository.add.should.have.calledWith(
        sinon.match.array.and(sinon.match.has('length', 5)),
      );
      testObj.proxyServerJobService.add.should.have.callCount(1);
      testObj.proxyServerJobService.add.should.have.calledWith(
        sinon.match
          .instanceOf(JobModel)
          .and(sinon.match.has('type', JobModel.TYPE_GENERATE_IP))
          .and(sinon.match.has('data', `${testObj.inputModel.ip}/${testObj.inputModel.mask}`))
          .and(sinon.match.has('status', JobModel.STATUS_PENDING))
          .and(sinon.match.has('totalRecord', 5)),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(JobModel);
    });
  });

  suite(`Reload all proxy`, () => {
    test(`Should error reload all proxy`, async () => {
      testObj.proxySquidRepository.reload.resolves([new UnknownException()]);

      const [error] = await testObj.proxyServerService.reload();

      testObj.proxySquidRepository.reload.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully reload all proxy`, async () => {
      testObj.proxySquidRepository.reload.resolves([null]);

      const [error] = await testObj.proxyServerService.reload();

      testObj.proxySquidRepository.reload.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });

  suite(`Delete ip list of proxy`, () => {
    setup(() => {
      const inputModel = new IpAddressModel();
      inputModel.ip = '192.168.1.0';
      inputModel.mask = 29;
      inputModel.gateway = '192.168.1.6';
      inputModel.interface = 'ens192';

      testObj.inputModel = inputModel;
    });

    test(`Should error delete ip list of proxy when remove ip list`, async () => {
      const inputModel = testObj.inputModel;
      testObj.proxyServerRepository.delete.resolves([new UnknownException()]);

      const [error] = await testObj.proxyServerService.delete(inputModel);

      testObj.proxyServerRepository.delete.should.have.callCount(1);
      testObj.proxyServerRepository.delete.should.have.calledWith(
        sinon.match.instanceOf(IpAddressModel),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error delete ip list of proxy when add job`, async () => {
      const inputModel = testObj.inputModel;
      testObj.proxyServerRepository.delete.resolves([null, 10]);
      testObj.proxyServerRegenerateJobService.add.resolves([new UnknownException()]);

      const [error] = await testObj.proxyServerService.delete(inputModel);

      testObj.proxyServerRepository.delete.should.have.callCount(1);
      testObj.proxyServerRepository.delete.should.have.calledWith(
        sinon.match.instanceOf(IpAddressModel),
      );
      testObj.proxyServerRegenerateJobService.add.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully delete ip list of proxy`, async () => {
      const inputModel = testObj.inputModel;
      testObj.proxyServerRepository.delete.resolves([null, 10]);
      const outputJobModel = new JobModel();
      outputJobModel.id = testObj.identifierGenerator.generateId();
      testObj.proxyServerRegenerateJobService.add.resolves([null, outputJobModel]);

      const [error, result] = await testObj.proxyServerService.delete(inputModel);

      testObj.proxyServerRepository.delete.should.have.callCount(1);
      testObj.proxyServerRepository.delete.should.have.calledWith(
        sinon.match.instanceOf(IpAddressModel),
      );
      testObj.proxyServerRegenerateJobService.add.should.have.callCount(1);
      testObj.proxyServerRegenerateJobService.add.should.have.calledWith(
        sinon.match
          .instanceOf(JobModel)
          .and(sinon.match.has('type', JobModel.TYPE_REMOVE_IP))
          .and(sinon.match.has('data', `${testObj.inputModel.ip}/${testObj.inputModel.mask}`))
          .and(sinon.match.has('status', JobModel.STATUS_PENDING))
          .and(sinon.match.has('totalRecord', 10))
          .and(sinon.match.has('totalRecordDelete', 10)),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(JobModel);
    });
  });
});
