/**
 * Created by pooya on 8/31/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const JobModel = require('~src/core/model/jobModel');
const ModelIdNotExistException = require('~src/core/exception/modelIdNotExistException');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');
const DatabaseMinParamUpdateException = require('~src/core/exception/databaseMinParamUpdateException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

/**
 * @property eventually
 * @property rejectedWith
 */
const expect = chai.expect;
const testObj = {};

suite(`JobRepository`, () => {
  setup(() => {
    const { postgresDb, identifierGenerator, jobRepository } = helper.fakeJobPgRepository();

    testObj.postgresDb = postgresDb;
    testObj.identifierGeneratorSystem = identifierGenerator;
    testObj.jobRepository = jobRepository;

    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.fillModelSpy = sinon.spy(testObj.jobRepository, '_fillModel');
  });

  teardown(() => {
    testObj.fillModelSpy.restore();
  });

  suite(`Get by id`, () => {
    test(`Should error get by id when fetch from database`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.jobRepository.getById(inputId);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully get by id return null`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const fetchQuery = {
        get rowCount() {
          return 0;
        },
        get rows() {
          return [];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.jobRepository.getById(inputId);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([inputId])),
      );
      testObj.fillModelSpy.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.a('null');
    });

    test(`Should successfully get by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              data: '192.168.1.1/28',
              status: JobModel.STATUS_SUCCESS,
              total_record: 3,
              total_record_add: 2,
              total_record_exist: 1,
              total_record_error: 0,
              insert_date: '2021-08-31 11:29:50',
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.jobRepository.getById(inputId);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([inputId])),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(JobModel);
      expect(result).to.be.includes({
        id: testObj.identifierGenerator.generateId(),
        data: '192.168.1.1/28',
        status: JobModel.STATUS_SUCCESS,
        totalRecord: 3,
        totalRecordAdd: 2,
        totalRecordExist: 1,
        totalRecordError: 0,
      });
    });
  });

  suite(`Add new job`, () => {
    setup(() => {
      const inputModel = new JobModel();
      inputModel.data = '192.168.1.1/28';
      inputModel.status = JobModel.STATUS_SUCCESS;
      inputModel.totalRecord = 3;
      inputModel.totalRecordAdd = 2;
      inputModel.totalRecordExist = 1;
      inputModel.totalRecordError = 0;

      testObj.inputModel = inputModel;
    });

    test(`Should error add job user in database`, async () => {
      const inputModel = testObj.inputModel;
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.jobRepository.add(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully add new job in database`, async () => {
      const inputModel = testObj.inputModel;
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              data: '192.168.1.1/28',
              status: JobModel.STATUS_SUCCESS,
              total_record: 3,
              total_record_add: 2,
              total_record_exist: 1,
              total_record_error: 0,
              insert_date: '2021-08-31 11:29:50',
            },
          ];
        },
      };
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.jobRepository.add(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array
            .startsWith([
              testObj.identifierGenerator.generateId(),
              inputModel.data,
              inputModel.status,
            ])
            .and(sinon.match.has('length', 4)),
        ),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.instanceOf(JobModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        data: '192.168.1.1/28',
        status: JobModel.STATUS_SUCCESS,
        totalRecord: 3,
        totalRecordAdd: 2,
        totalRecordExist: 1,
        totalRecordError: 0,
      });
    });
  });

  suite(`Update job`, () => {
    test(`Should error update job when model id not found`, async () => {
      const inputModel = new JobModel();

      const [error] = await testObj.jobRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(0);
      expect(error).to.be.an.instanceof(ModelIdNotExistException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', true);
    });

    test(`Should error update job when model property not set`, async () => {
      const inputModel = new JobModel();
      inputModel.id = testObj.identifierGenerator.generateId();

      const [error] = await testObj.jobRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(0);
      expect(error).to.be.an.instanceof(DatabaseMinParamUpdateException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', true);
    });

    test(`Should error update job when execute query`, async () => {
      const inputModel = new JobModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.status = JobModel.STATUS_SUCCESS;
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.jobRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully update job`, async () => {
      const inputModel = new JobModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.status = JobModel.STATUS_SUCCESS;
      testObj.postgresDb.query.resolves();

      const [error] = await testObj.jobRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });
});
