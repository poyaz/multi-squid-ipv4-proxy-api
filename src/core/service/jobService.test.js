/**
 * Created by pooya on 8/31/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const JobModel = require('~src/core/model/jobModel');
const UnknownException = require('~src/core/exception/unknownException');
const NotFoundException = require('~src/core/exception/notFoundException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`JobService`, () => {
  setup(() => {
    const { jobRepository, jobService } = helper.fakeJobService();

    testObj.jobRepository = jobRepository;
    testObj.jobService = jobService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
  });

  suite(`Get job by id`, () => {
    test(`Should error get job by id when fetch data`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.jobRepository.getById.resolves([new UnknownException()]);

      const [error] = await testObj.jobService.getById(inputId);

      testObj.jobRepository.getById.should.have.callCount(1);
      testObj.jobRepository.getById.should.have.calledWith(sinon.match(inputId));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error get job by id when not found job`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.jobRepository.getById.resolves([null, null]);

      const [error] = await testObj.jobService.getById(inputId);

      testObj.jobRepository.getById.should.have.callCount(1);
      testObj.jobRepository.getById.should.have.calledWith(sinon.match(inputId));
      expect(error).to.be.an.instanceof(NotFoundException);
      expect(error).to.have.property('httpCode', 404);
    });

    test(`Should successfully get job by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputModel = new JobModel();
      testObj.jobRepository.getById.resolves([null, outputModel]);

      const [error, result] = await testObj.jobService.getById(inputId);

      testObj.jobRepository.getById.should.have.callCount(1);
      testObj.jobRepository.getById.should.have.calledWith(sinon.match(inputId));
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(JobModel);
    });
  });
});
