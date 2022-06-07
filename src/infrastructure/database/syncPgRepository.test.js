/**
 * Created by pooya on 8/23/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const SyncModel = require('~src/core/model/syncModel');
const SubscriptionModel = require('~src/core/model/subscriptionModel');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');
const ModelIdNotExistException = require('~src/core/exception/modelIdNotExistException');
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

suite(`SyncPgRepository`, () => {
  setup(() => {
    const {
      postgresDb,
      dateTime,
      identifierGenerator,
      syncRepository,
    } = helper.fakeSyncPgRepository();

    testObj.postgresDb = postgresDb;
    testObj.dateTime = dateTime;
    testObj.identifierGeneratorSystem = identifierGenerator;
    testObj.syncRepository = syncRepository;

    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.fillModelSpy = sinon.spy(testObj.syncRepository, '_fillModel');
  });

  teardown(() => {
    testObj.fillModelSpy.restore();
  });

  suite(`Get list of package not synced`, () => {
    test(`Should error get list of package not synced`, async () => {
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.syncRepository.getListOfPackageNotSynced();

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array.deepEquals([SyncModel.SERVICE_SYNC_PACKAGE, 3]),
        ),
      );
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully list of package not synced`, async () => {
      const fetchQuery = {
        get rowCount() {
          return 0;
        },
        get rows() {
          return [];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.syncRepository.getListOfPackageNotSynced();

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array.deepEquals([SyncModel.SERVICE_SYNC_PACKAGE, 3]),
        ),
      );
      testObj.fillModelSpy.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should successfully get all list of package not synced`, async () => {
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: undefined,
              references_id: testObj.identifierGenerator.generateId(),
              service_name: SyncModel.SERVICE_SYNC_PACKAGE,
              status: SyncModel.STATUS_ERROR,
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.syncRepository.getListOfPackageNotSynced();

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array.deepEquals([SyncModel.SERVICE_SYNC_PACKAGE, 3]),
        ),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.instanceOf(SyncModel).and.includes({
        id: undefined,
        referencesId: testObj.identifierGenerator.generateId(),
        serviceName: SyncModel.SERVICE_SYNC_PACKAGE,
        status: SyncModel.STATUS_ERROR,
        insertDate: null,
        updateDate: null,
      });
    });
  });

  suite(`Get list of order not canceled`, () => {
    test(`Should error get list of order not canceled`, async () => {
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.syncRepository.getListOfOrderNotCanceled();

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array.deepEquals([
            SyncModel.SERVICE_CANCEL_SUBSCRIPTION,
            3,
            SubscriptionModel.STATUS_CANCELED,
          ]),
        ),
      );
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully list of order not canceled`, async () => {
      const fetchQuery = {
        get rowCount() {
          return 0;
        },
        get rows() {
          return [];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.syncRepository.getListOfOrderNotCanceled();

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array.deepEquals([
            SyncModel.SERVICE_CANCEL_SUBSCRIPTION,
            3,
            SubscriptionModel.STATUS_CANCELED,
          ]),
        ),
      );
      testObj.fillModelSpy.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should successfully get all list of order not canceled`, async () => {
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: undefined,
              references_id: testObj.identifierGenerator.generateId(),
              service_name: SyncModel.SERVICE_CANCEL_SUBSCRIPTION,
              status: SyncModel.STATUS_ERROR,
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.syncRepository.getListOfOrderNotCanceled();

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array.deepEquals([
            SyncModel.SERVICE_CANCEL_SUBSCRIPTION,
            3,
            SubscriptionModel.STATUS_CANCELED,
          ]),
        ),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.instanceOf(SyncModel).and.includes({
        id: undefined,
        referencesId: testObj.identifierGenerator.generateId(),
        serviceName: SyncModel.SERVICE_CANCEL_SUBSCRIPTION,
        status: SyncModel.STATUS_ERROR,
        insertDate: null,
        updateDate: null,
      });
    });
  });

  suite(`Get list of package not expired`, () => {
    test(`Should error get list of package not expired`, async () => {
      testObj.dateTime.gregorianCurrentDateWithTimezoneString.returns('date');
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.syncRepository.getListOfPackageNotExpired();

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array.deepEquals([SyncModel.SERVICE_EXPIRE_PACKAGE, 3, 'date']),
        ),
      );
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully list of package not expired`, async () => {
      testObj.dateTime.gregorianCurrentDateWithTimezoneString.returns('date');
      const fetchQuery = {
        get rowCount() {
          return 0;
        },
        get rows() {
          return [];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.syncRepository.getListOfPackageNotExpired();

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array.deepEquals([SyncModel.SERVICE_EXPIRE_PACKAGE, 3, 'date']),
        ),
      );
      testObj.fillModelSpy.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should successfully get all list of package not expired`, async () => {
      testObj.dateTime.gregorianCurrentDateWithTimezoneString.returns('date');
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: undefined,
              references_id: testObj.identifierGenerator.generateId(),
              service_name: SyncModel.SERVICE_EXPIRE_PACKAGE,
              status: SyncModel.STATUS_ERROR,
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.syncRepository.getListOfPackageNotExpired();

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array.deepEquals([SyncModel.SERVICE_EXPIRE_PACKAGE, 3, 'date']),
        ),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.instanceOf(SyncModel).and.includes({
        id: undefined,
        referencesId: testObj.identifierGenerator.generateId(),
        serviceName: SyncModel.SERVICE_EXPIRE_PACKAGE,
        status: SyncModel.STATUS_ERROR,
        insertDate: null,
        updateDate: null,
      });
    });
  });

  suite(`Get list of in process status has been expired`, () => {
    test(`Should error get list of in process status has been expired`, async () => {
      testObj.dateTime.gregorianWithTimezoneString.returns('date');
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.syncRepository.getListOfInProcessExpired();

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([SyncModel.STATUS_PROCESS, 'date'])),
      );
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully list of in process status has been expired`, async () => {
      testObj.dateTime.gregorianWithTimezoneString.returns('date');
      const fetchQuery = {
        get rowCount() {
          return 0;
        },
        get rows() {
          return [];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.syncRepository.getListOfInProcessExpired();

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([SyncModel.STATUS_PROCESS, 'date'])),
      );
      testObj.fillModelSpy.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should successfully get all list of in process status has been expired`, async () => {
      testObj.dateTime.gregorianWithTimezoneString.returns('date');
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              references_id: testObj.identifierGenerator.generateId(),
              service_name: SyncModel.SERVICE_EXPIRE_PACKAGE,
              status: SyncModel.STATUS_PROCESS,
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.syncRepository.getListOfInProcessExpired();

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([SyncModel.STATUS_PROCESS, 'date'])),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.instanceOf(SyncModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        referencesId: testObj.identifierGenerator.generateId(),
        serviceName: SyncModel.SERVICE_EXPIRE_PACKAGE,
        status: SyncModel.STATUS_PROCESS,
        insertDate: null,
        updateDate: null,
      });
    });
  });

  suite(`Add sync`, () => {
    test(`Should error add new sync in database`, async () => {
      const inputModel = new SyncModel();
      inputModel.referencesId = testObj.identifierGenerator.generateId();
      inputModel.serviceName = SyncModel.SERVICE_SYNC_PACKAGE;
      inputModel.status = SyncModel.STATUS_PROCESS;
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.syncRepository.add(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully add new sync in database`, async () => {
      const inputModel = new SyncModel();
      inputModel.referencesId = testObj.identifierGenerator.generateId();
      inputModel.serviceName = SyncModel.SERVICE_SYNC_PACKAGE;
      inputModel.status = SyncModel.STATUS_PROCESS;
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              references_id: testObj.identifierGenerator.generateId(),
              service_name: SyncModel.SERVICE_SYNC_PACKAGE,
              status: SyncModel.STATUS_PROCESS,
            },
          ];
        },
      };
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );
      testObj.dateTime.gregorianCurrentDateWithTimezoneString.returns('date');
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.syncRepository.add(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array
            .startsWith([
              testObj.identifierGenerator.generateId(),
              inputModel.referencesId,
              inputModel.serviceName,
              inputModel.status,
              'date',
            ])
            .and(sinon.match.has('length', 5)),
        ),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(SyncModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        referencesId: testObj.identifierGenerator.generateId(),
        serviceName: SyncModel.SERVICE_SYNC_PACKAGE,
        status: SyncModel.STATUS_PROCESS,
        insertDate: null,
        updateDate: null,
      });
    });
  });

  suite(`Update sync`, () => {
    test(`Should error update sync when model id not found`, async () => {
      const inputModel = new SyncModel();

      const [error] = await testObj.syncRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(0);
      expect(error).to.be.an.instanceof(ModelIdNotExistException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', true);
    });

    test(`Should error update sync when model property not set`, async () => {
      const inputModel = new SyncModel();
      inputModel.id = testObj.identifierGenerator.generateId();

      const [error] = await testObj.syncRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(0);
      expect(error).to.be.an.instanceof(DatabaseMinParamUpdateException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', true);
    });

    test(`Should error update sync when execute query`, async () => {
      const inputModel = new SyncModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.status = SyncModel.STATUS_ERROR;
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.syncRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully update sync`, async () => {
      const inputModel = new SyncModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.status = SyncModel.STATUS_ERROR;
      testObj.postgresDb.query.resolves();

      const [error] = await testObj.syncRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });
});
