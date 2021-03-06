/**
 * Created by pooya on 5/24/22.
 */

/**
 * Created by pooya on 8/23/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const SyncModel = require('~src/core/model/syncModel');
const UserModel = require('~src/core/model/userModel');
const UnknownException = require('~src/core/exception/unknownException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`SyncService`, () => {
  setup(() => {
    const { syncRepository, packageService, userService, syncService } = helper.fakeSyncService();

    testObj.syncRepository = syncRepository;
    testObj.packageService = packageService;
    testObj.userService = userService;
    testObj.syncService = syncService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.consoleError = sinon.stub(console, 'error');
  });

  teardown(() => {
    testObj.consoleError.restore();
  });

  suite(`Sync all package`, () => {
    setup(() => {
      const outputModel1 = new SyncModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.referencesId = testObj.identifierGenerator.generateId();
      outputModel1.serviceName = SyncModel.SERVICE_SYNC_PACKAGE;
      outputModel1.insertDate = new Date();

      testObj.outputModel1 = outputModel1;

      const outputAddModel = new SyncModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.referencesId = testObj.identifierGenerator.generateId();
      outputModel1.serviceName = SyncModel.SERVICE_SYNC_PACKAGE;

      testObj.outputAddModel = outputAddModel;
    });

    test(`Should error get list of package has not been synced`, async () => {
      testObj.syncRepository.getListOfPackageNotSynced.resolves([new UnknownException()]);

      const [error] = await testObj.syncService.executePackageHasBeenSynced();

      testObj.syncRepository.getListOfPackageNotSynced.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully skip get list of package has not been synced because time of process has been ended`, async () => {
      const outputModel1 = new SyncModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.referencesId = testObj.identifierGenerator.generateId();
      outputModel1.serviceName = SyncModel.SERVICE_SYNC_PACKAGE;
      outputModel1.status = SyncModel.STATUS_PROCESS;
      testObj.syncRepository.getListOfPackageNotSynced.resolves([null, [outputModel1]]);

      const [error] = await testObj.syncService.executePackageHasBeenSynced();

      testObj.syncRepository.getListOfPackageNotSynced.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(0);
      testObj.consoleError.should.have.callCount(0);
      expect(error).to.be.a('null');
    });

    test(`Should error get list of package has not been synced when can't add sync status for package`, async () => {
      const outputModel = [testObj.outputModel1];
      testObj.syncRepository.getListOfPackageNotSynced.resolves([null, outputModel]);
      testObj.syncRepository.add.resolves([new UnknownException()]);

      const [error] = await testObj.syncService.executePackageHasBeenSynced();

      testObj.syncRepository.getListOfPackageNotSynced.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(1);
      testObj.syncRepository.add.should.have.calledWith(
        sinon.match
          .has('referencesId', testObj.outputModel1.referencesId)
          .and(sinon.match.has('serviceName', SyncModel.SERVICE_SYNC_PACKAGE))
          .and(sinon.match.has('status', SyncModel.STATUS_PROCESS)),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should error get list of package has not been synced when execute sync package`, async () => {
      const outputModel = [testObj.outputModel1];
      testObj.syncRepository.getListOfPackageNotSynced.resolves([null, outputModel]);
      const outputAddModel = testObj.outputAddModel;
      testObj.syncRepository.add.resolves([null, outputAddModel]);
      testObj.packageService.syncPackageById.resolves([new UnknownException()]);
      testObj.syncRepository.update.resolves([null]);

      const [error] = await testObj.syncService.executePackageHasBeenSynced();

      testObj.syncRepository.getListOfPackageNotSynced.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(1);
      testObj.syncRepository.add.should.have.calledWith(
        sinon.match
          .has('referencesId', testObj.outputModel1.referencesId)
          .and(sinon.match.has('serviceName', SyncModel.SERVICE_SYNC_PACKAGE))
          .and(sinon.match.has('status', SyncModel.STATUS_PROCESS)),
      );
      testObj.packageService.syncPackageById.should.have.callCount(1);
      testObj.syncRepository.update.should.have.callCount(1);
      testObj.syncRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.outputAddModel.id)
          .and(sinon.match.has('status', SyncModel.STATUS_ERROR)),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should error get list of package has not been synced when update sync package`, async () => {
      const outputModel = [testObj.outputModel1];
      testObj.syncRepository.getListOfPackageNotSynced.resolves([null, outputModel]);
      const outputAddModel = testObj.outputAddModel;
      testObj.syncRepository.add.resolves([null, outputAddModel]);
      testObj.packageService.syncPackageById.resolves([null]);
      testObj.syncRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.syncService.executePackageHasBeenSynced();

      testObj.syncRepository.getListOfPackageNotSynced.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(1);
      testObj.syncRepository.add.should.have.calledWith(
        sinon.match
          .has('referencesId', testObj.outputModel1.referencesId)
          .and(sinon.match.has('serviceName', SyncModel.SERVICE_SYNC_PACKAGE))
          .and(sinon.match.has('status', SyncModel.STATUS_PROCESS)),
      );
      testObj.packageService.syncPackageById.should.have.callCount(1);
      testObj.syncRepository.update.should.have.callCount(1);
      testObj.syncRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.outputAddModel.id)
          .and(sinon.match.has('status', SyncModel.STATUS_SUCCESS)),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should successfully get list of package has not been synced`, async () => {
      const outputModel = [testObj.outputModel1];
      testObj.syncRepository.getListOfPackageNotSynced.resolves([null, outputModel]);
      const outputAddModel = testObj.outputAddModel;
      testObj.syncRepository.add.resolves([null, outputAddModel]);
      testObj.packageService.syncPackageById.resolves([null]);
      testObj.syncRepository.update.resolves([null]);

      const [error] = await testObj.syncService.executePackageHasBeenSynced();

      testObj.syncRepository.getListOfPackageNotSynced.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(1);
      testObj.syncRepository.add.should.have.calledWith(
        sinon.match
          .has('referencesId', testObj.outputModel1.referencesId)
          .and(sinon.match.has('serviceName', SyncModel.SERVICE_SYNC_PACKAGE))
          .and(sinon.match.has('status', SyncModel.STATUS_PROCESS)),
      );
      testObj.packageService.syncPackageById.should.have.callCount(1);
      testObj.syncRepository.update.should.have.callCount(1);
      testObj.syncRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.outputAddModel.id)
          .and(sinon.match.has('status', SyncModel.STATUS_SUCCESS)),
      );
      testObj.consoleError.should.have.callCount(0);
      expect(error).to.be.a('null');
    });
  });

  suite(`Sync cancel order`, () => {
    setup(() => {
      const outputModel1 = new SyncModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.referencesId = testObj.identifierGenerator.generateId();
      outputModel1.serviceName = SyncModel.SERVICE_CANCEL_SUBSCRIPTION;
      outputModel1.insertDate = new Date();

      testObj.outputModel1 = outputModel1;

      const outputAddModel = new SyncModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.referencesId = testObj.identifierGenerator.generateId();
      outputModel1.serviceName = SyncModel.SERVICE_CANCEL_SUBSCRIPTION;

      testObj.outputAddModel = outputAddModel;
    });

    test(`Should error get list of cancel order has not been synced`, async () => {
      testObj.syncRepository.getListOfOrderNotCanceled.resolves([new UnknownException()]);

      const [error] = await testObj.syncService.executeOrderHasBeenCanceled();

      testObj.syncRepository.getListOfOrderNotCanceled.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error get list of cancel order has not been synced when fetch list of each order`, async () => {
      testObj.syncRepository.getListOfOrderNotCanceled.resolves([new UnknownException()]);

      const [error] = await testObj.syncService.executeOrderHasBeenCanceled();

      testObj.syncRepository.getListOfOrderNotCanceled.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error get list of cancel order has not been synced when can't add sync status for order`, async () => {
      const outputModel = [testObj.outputModel1];
      testObj.syncRepository.getListOfOrderNotCanceled.resolves([null, outputModel]);
      testObj.syncRepository.add.resolves([new UnknownException()]);

      const [error] = await testObj.syncService.executeOrderHasBeenCanceled();

      testObj.syncRepository.getListOfOrderNotCanceled.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(1);
      testObj.syncRepository.add.should.have.calledWith(
        sinon.match
          .has('referencesId', testObj.outputModel1.referencesId)
          .and(sinon.match.has('serviceName', SyncModel.SERVICE_CANCEL_SUBSCRIPTION))
          .and(sinon.match.has('status', SyncModel.STATUS_PROCESS)),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should error get list of cancel order has not been synced when execute sync order`, async () => {
      const outputModel = [testObj.outputModel1];
      testObj.syncRepository.getListOfOrderNotCanceled.resolves([null, outputModel]);
      const outputAddModel = testObj.outputAddModel;
      testObj.syncRepository.add.resolves([null, outputAddModel]);
      testObj.packageService.cancel.resolves([new UnknownException()]);
      testObj.syncRepository.update.resolves([null]);

      const [error] = await testObj.syncService.executeOrderHasBeenCanceled();

      testObj.syncRepository.getListOfOrderNotCanceled.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(1);
      testObj.syncRepository.add.should.have.calledWith(
        sinon.match
          .has('referencesId', testObj.outputModel1.referencesId)
          .and(sinon.match.has('serviceName', SyncModel.SERVICE_CANCEL_SUBSCRIPTION))
          .and(sinon.match.has('status', SyncModel.STATUS_PROCESS)),
      );
      testObj.packageService.cancel.should.have.callCount(1);
      testObj.syncRepository.update.should.have.callCount(1);
      testObj.syncRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.outputAddModel.id)
          .and(sinon.match.has('status', SyncModel.STATUS_ERROR)),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should error get list of cancel order has not been synced when update sync order`, async () => {
      const outputModel = [testObj.outputModel1];
      testObj.syncRepository.getListOfOrderNotCanceled.resolves([null, outputModel]);
      const outputAddModel = testObj.outputAddModel;
      testObj.syncRepository.add.resolves([null, outputAddModel]);
      testObj.packageService.cancel.resolves([null]);
      testObj.syncRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.syncService.executeOrderHasBeenCanceled();

      testObj.syncRepository.getListOfOrderNotCanceled.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(1);
      testObj.syncRepository.add.should.have.calledWith(
        sinon.match
          .has('referencesId', testObj.outputModel1.referencesId)
          .and(sinon.match.has('serviceName', SyncModel.SERVICE_CANCEL_SUBSCRIPTION))
          .and(sinon.match.has('status', SyncModel.STATUS_PROCESS)),
      );
      testObj.packageService.cancel.should.have.callCount(1);
      testObj.syncRepository.update.should.have.callCount(1);
      testObj.syncRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.outputAddModel.id)
          .and(sinon.match.has('status', SyncModel.STATUS_SUCCESS)),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should successfully get list of cancel order has not been synced`, async () => {
      const outputModel = [testObj.outputModel1];
      testObj.syncRepository.getListOfOrderNotCanceled.resolves([null, outputModel]);
      const outputAddModel = testObj.outputAddModel;
      testObj.syncRepository.add.resolves([null, outputAddModel]);
      testObj.packageService.cancel.resolves([null]);
      testObj.syncRepository.update.resolves([null]);

      const [error] = await testObj.syncService.executeOrderHasBeenCanceled();

      testObj.syncRepository.getListOfOrderNotCanceled.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(1);
      testObj.syncRepository.add.should.have.calledWith(
        sinon.match
          .has('referencesId', testObj.outputModel1.referencesId)
          .and(sinon.match.has('serviceName', SyncModel.SERVICE_CANCEL_SUBSCRIPTION))
          .and(sinon.match.has('status', SyncModel.STATUS_PROCESS)),
      );
      testObj.packageService.cancel.should.have.callCount(1);
      testObj.syncRepository.update.should.have.callCount(1);
      testObj.syncRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.outputAddModel.id)
          .and(sinon.match.has('status', SyncModel.STATUS_SUCCESS)),
      );
      testObj.consoleError.should.have.callCount(0);
      expect(error).to.be.a('null');
    });
  });

  suite(`Sync expire package`, () => {
    setup(() => {
      const outputModel1 = new SyncModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.referencesId = testObj.identifierGenerator.generateId();
      outputModel1.serviceName = SyncModel.SERVICE_EXPIRE_PACKAGE;
      outputModel1.insertDate = new Date();

      testObj.outputModel1 = outputModel1;

      const outputAddModel = new SyncModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.referencesId = testObj.identifierGenerator.generateId();
      outputModel1.serviceName = SyncModel.SERVICE_EXPIRE_PACKAGE;

      testObj.outputAddModel = outputAddModel;
    });

    test(`Should error get list of expire package has not been synced`, async () => {
      testObj.syncRepository.getListOfPackageNotExpired.resolves([new UnknownException()]);

      const [error] = await testObj.syncService.executePackageHasBeenExpired();

      testObj.syncRepository.getListOfPackageNotExpired.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully skip get list of expire package has not been synced because time of process has been ended`, async () => {
      const outputModel1 = new SyncModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.referencesId = testObj.identifierGenerator.generateId();
      outputModel1.serviceName = SyncModel.SERVICE_EXPIRE_PACKAGE;
      outputModel1.status = SyncModel.STATUS_PROCESS;
      testObj.syncRepository.getListOfPackageNotExpired.resolves([null, [outputModel1]]);

      const [error] = await testObj.syncService.executePackageHasBeenExpired();

      testObj.syncRepository.getListOfPackageNotExpired.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(0);
      testObj.consoleError.should.have.callCount(0);
      expect(error).to.be.a('null');
    });

    test(`Should error get list of expire package has not been synced when can't add sync status for package`, async () => {
      const outputModel = [testObj.outputModel1];
      testObj.syncRepository.getListOfPackageNotExpired.resolves([null, outputModel]);
      testObj.syncRepository.add.resolves([new UnknownException()]);

      const [error] = await testObj.syncService.executePackageHasBeenExpired();

      testObj.syncRepository.getListOfPackageNotExpired.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(1);
      testObj.syncRepository.add.should.have.calledWith(
        sinon.match
          .has('referencesId', testObj.outputModel1.referencesId)
          .and(sinon.match.has('serviceName', SyncModel.SERVICE_EXPIRE_PACKAGE))
          .and(sinon.match.has('status', SyncModel.STATUS_PROCESS)),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should error get list of expire package has not been synced when execute sync package`, async () => {
      const outputModel = [testObj.outputModel1];
      testObj.syncRepository.getListOfPackageNotExpired.resolves([null, outputModel]);
      const outputAddModel = testObj.outputAddModel;
      testObj.syncRepository.add.resolves([null, outputAddModel]);
      testObj.packageService.syncPackageById.resolves([new UnknownException()]);
      testObj.syncRepository.update.resolves([null]);

      const [error] = await testObj.syncService.executePackageHasBeenExpired();

      testObj.syncRepository.getListOfPackageNotExpired.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(1);
      testObj.syncRepository.add.should.have.calledWith(
        sinon.match
          .has('referencesId', testObj.outputModel1.referencesId)
          .and(sinon.match.has('serviceName', SyncModel.SERVICE_EXPIRE_PACKAGE))
          .and(sinon.match.has('status', SyncModel.STATUS_PROCESS)),
      );
      testObj.packageService.syncPackageById.should.have.callCount(1);
      testObj.syncRepository.update.should.have.callCount(1);
      testObj.syncRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.outputAddModel.id)
          .and(sinon.match.has('status', SyncModel.STATUS_ERROR)),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should error get list of expire package has not been synced when update sync package`, async () => {
      const outputModel = [testObj.outputModel1];
      testObj.syncRepository.getListOfPackageNotExpired.resolves([null, outputModel]);
      const outputAddModel = testObj.outputAddModel;
      testObj.syncRepository.add.resolves([null, outputAddModel]);
      testObj.packageService.syncPackageById.resolves([null]);
      testObj.syncRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.syncService.executePackageHasBeenExpired();

      testObj.syncRepository.getListOfPackageNotExpired.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(1);
      testObj.syncRepository.add.should.have.calledWith(
        sinon.match
          .has('referencesId', testObj.outputModel1.referencesId)
          .and(sinon.match.has('serviceName', SyncModel.SERVICE_EXPIRE_PACKAGE))
          .and(sinon.match.has('status', SyncModel.STATUS_PROCESS)),
      );
      testObj.packageService.syncPackageById.should.have.callCount(1);
      testObj.syncRepository.update.should.have.callCount(1);
      testObj.syncRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.outputAddModel.id)
          .and(sinon.match.has('status', SyncModel.STATUS_SUCCESS)),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should successfully get list of expire package has not been synced`, async () => {
      const outputModel = [testObj.outputModel1];
      testObj.syncRepository.getListOfPackageNotExpired.resolves([null, outputModel]);
      const outputAddModel = testObj.outputAddModel;
      testObj.syncRepository.add.resolves([null, outputAddModel]);
      testObj.packageService.syncPackageById.resolves([null]);
      testObj.syncRepository.update.resolves([null]);

      const [error] = await testObj.syncService.executePackageHasBeenExpired();

      testObj.syncRepository.getListOfPackageNotExpired.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(1);
      testObj.syncRepository.add.should.have.calledWith(
        sinon.match
          .has('referencesId', testObj.outputModel1.referencesId)
          .and(sinon.match.has('serviceName', SyncModel.SERVICE_EXPIRE_PACKAGE))
          .and(sinon.match.has('status', SyncModel.STATUS_PROCESS)),
      );
      testObj.packageService.syncPackageById.should.have.callCount(1);
      testObj.syncRepository.update.should.have.callCount(1);
      testObj.syncRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.outputAddModel.id)
          .and(sinon.match.has('status', SyncModel.STATUS_SUCCESS)),
      );
      testObj.consoleError.should.have.callCount(0);
      expect(error).to.be.a('null');
    });
  });

  suite(`Find in process has been expired`, () => {
    setup(() => {
      const outputModel1 = new SyncModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.referencesId = testObj.identifierGenerator.generateId();
      outputModel1.serviceName = SyncModel.SERVICE_SYNC_PACKAGE;
      outputModel1.status = SyncModel.STATUS_PROCESS;
      outputModel1.insertDate = new Date();

      testObj.outputModel1 = outputModel1;
    });

    test(`Should error find in process has been expired`, async () => {
      testObj.syncRepository.getListOfInProcessExpired.resolves([new UnknownException()]);

      const [error] = await testObj.syncService.executeFindInProcessHasBeenExpired();

      testObj.syncRepository.getListOfInProcessExpired.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error find in process has been expired when update status`, async () => {
      const outputModel = [testObj.outputModel1];
      testObj.syncRepository.getListOfInProcessExpired.resolves([null, outputModel]);
      testObj.syncRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.syncService.executeFindInProcessHasBeenExpired();

      testObj.syncRepository.getListOfInProcessExpired.should.have.callCount(1);
      testObj.syncRepository.update.should.have.callCount(1);
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should successfully find in process has been expired when update status`, async () => {
      const outputModel = [testObj.outputModel1];
      testObj.syncRepository.getListOfInProcessExpired.resolves([null, outputModel]);
      testObj.syncRepository.update.resolves([null]);

      const [error] = await testObj.syncService.executeFindInProcessHasBeenExpired();

      testObj.syncRepository.getListOfInProcessExpired.should.have.callCount(1);
      testObj.syncRepository.update.should.have.callCount(1);
      testObj.consoleError.should.have.callCount(0);
      expect(error).to.be.a('null');
    });
  });

  suite(`Sync users`, () => {
    setup(() => {
      const outputModel1 = new SyncModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.referencesId = testObj.identifierGenerator.generateId();
      outputModel1.serviceName = SyncModel.SERVICE_SYNC_USER;
      outputModel1.insertDate = new Date();

      testObj.outputModel1 = outputModel1;

      const outputAddModel = new SyncModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.referencesId = testObj.identifierGenerator.generateId();
      outputModel1.serviceName = SyncModel.SERVICE_EXPIRE_PACKAGE;

      testObj.outputAddModel = outputAddModel;

      const outputUserModel = new UserModel();
      outputUserModel.id = testObj.identifierGenerator.generateId();
      outputUserModel.username = 'user';
      outputUserModel.password = 'pass';
      outputUserModel.isEnable = true;

      testObj.outputUserModel = outputUserModel;
    });

    test(`Should error get list of user should sync`, async () => {
      testObj.syncRepository.getListOfUserNotSynced.resolves([new UnknownException()]);

      const [error] = await testObj.syncService.executeUserHasBeenSynced();

      testObj.syncRepository.getListOfUserNotSynced.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully skip get list of user should sync because time of process has been ended`, async () => {
      const outputModel1 = new SyncModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.referencesId = testObj.identifierGenerator.generateId();
      outputModel1.serviceName = SyncModel.SERVICE_EXPIRE_PACKAGE;
      outputModel1.status = SyncModel.STATUS_PROCESS;
      testObj.syncRepository.getListOfUserNotSynced.resolves([null, [outputModel1]]);

      const [error] = await testObj.syncService.executeUserHasBeenSynced();

      testObj.syncRepository.getListOfUserNotSynced.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(0);
      testObj.consoleError.should.have.callCount(0);
      expect(error).to.be.a('null');
    });

    test(`Should error get list of user should sync when can't add sync status for user`, async () => {
      const outputModel = [testObj.outputModel1];
      testObj.syncRepository.getListOfUserNotSynced.resolves([null, outputModel]);
      testObj.syncRepository.add.resolves([new UnknownException()]);

      const [error] = await testObj.syncService.executeUserHasBeenSynced();

      testObj.syncRepository.getListOfUserNotSynced.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(1);
      testObj.syncRepository.add.should.have.calledWith(
        sinon.match
          .has('referencesId', testObj.outputModel1.referencesId)
          .and(sinon.match.has('serviceName', SyncModel.SERVICE_EXPIRE_PACKAGE))
          .and(sinon.match.has('status', SyncModel.STATUS_PROCESS)),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should error get list of user should sync when execute get user by id`, async () => {
      const outputModel = [testObj.outputModel1];
      testObj.syncRepository.getListOfUserNotSynced.resolves([null, outputModel]);
      const outputAddModel = testObj.outputAddModel;
      testObj.syncRepository.add.resolves([null, outputAddModel]);
      testObj.userService.getUserById.resolves([new UnknownException()]);
      testObj.syncRepository.update.resolves([null]);

      const [error] = await testObj.syncService.executeUserHasBeenSynced();

      testObj.syncRepository.getListOfUserNotSynced.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(1);
      testObj.syncRepository.add.should.have.calledWith(
        sinon.match
          .has('referencesId', testObj.outputModel1.referencesId)
          .and(sinon.match.has('serviceName', SyncModel.SERVICE_EXPIRE_PACKAGE))
          .and(sinon.match.has('status', SyncModel.STATUS_PROCESS)),
      );
      testObj.userService.getUserById.should.have.callCount(1);
      testObj.syncRepository.update.should.have.callCount(1);
      testObj.syncRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.outputAddModel.id)
          .and(sinon.match.has('status', SyncModel.STATUS_ERROR)),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should error get list of user should sync when execute update user by id`, async () => {
      const outputModel = [testObj.outputModel1];
      testObj.syncRepository.getListOfUserNotSynced.resolves([null, outputModel]);
      const outputAddModel = testObj.outputAddModel;
      testObj.syncRepository.add.resolves([null, outputAddModel]);
      const outputUserModel = testObj.outputUserModel;
      testObj.userService.getUserById.resolves([null, outputUserModel]);
      testObj.userService.changePassword.resolves([new UnknownException()]);
      testObj.syncRepository.update.resolves([null]);

      const [error] = await testObj.syncService.executeUserHasBeenSynced();

      testObj.syncRepository.getListOfUserNotSynced.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(1);
      testObj.syncRepository.add.should.have.calledWith(
        sinon.match
          .has('referencesId', testObj.outputModel1.referencesId)
          .and(sinon.match.has('serviceName', SyncModel.SERVICE_EXPIRE_PACKAGE))
          .and(sinon.match.has('status', SyncModel.STATUS_PROCESS)),
      );
      testObj.userService.getUserById.should.have.callCount(1);
      testObj.userService.changePassword.should.have.callCount(1);
      testObj.userService.changePassword.should.have.calledWith(
        sinon.match(outputUserModel.username),
        sinon.match(outputUserModel.password),
      );
      testObj.syncRepository.update.should.have.callCount(1);
      testObj.syncRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.outputAddModel.id)
          .and(sinon.match.has('status', SyncModel.STATUS_ERROR)),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should error get list of user should sync when update sync`, async () => {
      const outputModel = [testObj.outputModel1];
      testObj.syncRepository.getListOfUserNotSynced.resolves([null, outputModel]);
      const outputAddModel = testObj.outputAddModel;
      testObj.syncRepository.add.resolves([null, outputAddModel]);
      const outputUserModel = testObj.outputUserModel;
      testObj.userService.getUserById.resolves([null, outputUserModel]);
      testObj.userService.changePassword.resolves([null]);
      testObj.syncRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.syncService.executeUserHasBeenSynced();

      testObj.syncRepository.getListOfUserNotSynced.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(1);
      testObj.syncRepository.add.should.have.calledWith(
        sinon.match
          .has('referencesId', testObj.outputModel1.referencesId)
          .and(sinon.match.has('serviceName', SyncModel.SERVICE_EXPIRE_PACKAGE))
          .and(sinon.match.has('status', SyncModel.STATUS_PROCESS)),
      );
      testObj.userService.getUserById.should.have.callCount(1);
      testObj.userService.changePassword.should.have.callCount(1);
      testObj.userService.changePassword.should.have.calledWith(
        sinon.match(outputUserModel.username),
        sinon.match(outputUserModel.password),
      );
      testObj.syncRepository.update.should.have.callCount(1);
      testObj.syncRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.outputAddModel.id)
          .and(sinon.match.has('status', SyncModel.STATUS_SUCCESS)),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should successfully get list of user should sync when update sync`, async () => {
      const outputModel = [testObj.outputModel1];
      testObj.syncRepository.getListOfUserNotSynced.resolves([null, outputModel]);
      const outputAddModel = testObj.outputAddModel;
      testObj.syncRepository.add.resolves([null, outputAddModel]);
      const outputUserModel = testObj.outputUserModel;
      testObj.userService.getUserById.resolves([null, outputUserModel]);
      testObj.userService.changePassword.resolves([null]);
      testObj.syncRepository.update.resolves([null]);

      const [error] = await testObj.syncService.executeUserHasBeenSynced();

      testObj.syncRepository.getListOfUserNotSynced.should.have.callCount(1);
      testObj.syncRepository.add.should.have.callCount(1);
      testObj.syncRepository.add.should.have.calledWith(
        sinon.match
          .has('referencesId', testObj.outputModel1.referencesId)
          .and(sinon.match.has('serviceName', SyncModel.SERVICE_EXPIRE_PACKAGE))
          .and(sinon.match.has('status', SyncModel.STATUS_PROCESS)),
      );
      testObj.userService.getUserById.should.have.callCount(1);
      testObj.userService.changePassword.should.have.callCount(1);
      testObj.userService.changePassword.should.have.calledWith(
        sinon.match(outputUserModel.username),
        sinon.match(outputUserModel.password),
      );
      testObj.syncRepository.update.should.have.callCount(1);
      testObj.syncRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.outputAddModel.id)
          .and(sinon.match.has('status', SyncModel.STATUS_SUCCESS)),
      );
      testObj.consoleError.should.have.callCount(0);
      expect(error).to.be.a('null');
    });
  });
});
