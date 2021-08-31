/**
 * Created by pooya on 8/31/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const { createRequest, createResponse } = require('node-mocks-http');

const helper = require('~src/helper');

const JobModel = require('~src/core/model/jobModel');
const UnknownException = require('~src/core/exception/unknownException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
chai.use(chaiAsPromised);

const expect = chai.expect;
const testObj = {};

suite(`JobController`, () => {
  setup(() => {
    testObj.req = new createRequest();
    testObj.res = new createResponse();

    const { jobService, jobController } = helper.fakeJobController(
      testObj.req,
      testObj.res,
    );

    testObj.jobService = jobService;
    testObj.jobController = jobController;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.dateRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/;
    testObj.expireRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
  });

  suite(`Get job by id`, () => {
    test(`Should error get job by id`, async () => {
      testObj.req.params = { jobId: testObj.identifierGenerator.generateId() };
      testObj.jobService.getById.resolves([new UnknownException()]);

      const [error] = await testObj.jobController.getJobByid();

      testObj.jobService.getById.should.have.callCount(1);
      testObj.jobService.getById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully generate ip for proxy with job id`, async () => {
      testObj.req.params = { jobId: testObj.identifierGenerator.generateId() };
      const outputModel = new JobModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.data = '192.168.1.1/29';
      outputModel.status = JobModel.STATUS_SUCCESS;
      outputModel.totalRecord = 5;
      outputModel.totalRecordAdd = 3;
      outputModel.totalRecordExist = 2;
      outputModel.totalRecordError = 0;
      outputModel.insertDate = new Date();
      testObj.jobService.getById.resolves([null, outputModel]);

      const [error, result] = await testObj.jobController.getJobByid();

      testObj.jobService.getById.should.have.callCount(1);
      testObj.jobService.getById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.a('object').and.have.include({
        id: testObj.identifierGenerator.generateId(),
        data: '192.168.1.1/29',
        status: JobModel.STATUS_SUCCESS,
        totalRecord: 5,
        totalRecordAdd: 3,
        totalRecordExist: 2,
        totalRecordError: 0,
      });
      expect(result.insertDate).to.have.match(testObj.dateRegex);
    });
  });
});
