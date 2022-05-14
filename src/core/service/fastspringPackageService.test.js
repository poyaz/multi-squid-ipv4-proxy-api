/**
 * Created by pooya on 5/2/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const OrderModel = require('~src/core/model/orderModel');
const PackageModel = require('~src/core/model/packageModel');
const SubscriptionModel = require('~src/core/model/subscriptionModel');
const UnknownException = require('~src/core/exception/unknownException');
const SyncPackageProxyException = require('~src/core/exception/syncPackageProxyException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`FastspringPackageService`, () => {
  setup(() => {
    const {
      packageService,
      packageRepository,
      orderRepository,
      fastspringApiRepository,
      fastspringPackageService,
    } = helper.fakeFastspringPackageService();

    testObj.packageService = packageService;
    testObj.packageRepository = packageRepository;
    testObj.orderRepository = orderRepository;
    testObj.fastspringApiRepository = fastspringApiRepository;
    testObj.fastspringPackageService = fastspringPackageService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.clock = sinon.useFakeTimers({
      now: new Date(2019, 1, 1, 0, 0),
      shouldAdvanceTime: true,
      advanceTimeDelta: 20,
    });
  });

  teardown(() => {
    testObj.clock.restore();
  });

  suite(`Get by id`, () => {
    setup(() => {
      const outputFetchModel = new PackageModel();
      outputFetchModel.id = testObj.identifierGenerator.generateId();
      outputFetchModel.userId = testObj.identifierGenerator.generateId();
      outputFetchModel.username = 'user1';
      outputFetchModel.countIp = 3;
      outputFetchModel.ipList = [
        { ip: '192.168.1.2', port: 8080 },
        { ip: '192.168.1.3', port: 8080 },
        { ip: '192.168.1.4', port: 8080 },
      ];
      outputFetchModel.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

      testObj.outputFetchModel = outputFetchModel;
    });

    test(`Should error get package by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.packageService.getById.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringPackageService.getById(inputId);

      testObj.packageService.getById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully get package by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputFetchModel = testObj.outputFetchModel;
      testObj.packageService.getById.resolves([null, outputFetchModel]);

      const [error, result] = await testObj.fastspringPackageService.getById(inputId);

      testObj.packageService.getById.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(PackageModel);
      expect(result.countIp).to.be.equal(3);
    });
  });

  suite(`Get all package by username`, () => {
    setup(() => {
      const outputFetchModel1 = new PackageModel();
      outputFetchModel1.id = testObj.identifierGenerator.generateId();
      outputFetchModel1.userId = testObj.identifierGenerator.generateId();
      outputFetchModel1.username = 'user1';
      outputFetchModel1.countIp = 3;
      outputFetchModel1.ipList = [
        { ip: '192.168.1.2', port: 8080 },
        { ip: '192.168.1.3', port: 8080 },
        { ip: '192.168.1.4', port: 8080 },
      ];
      outputFetchModel1.expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

      testObj.outputFetchModel1 = outputFetchModel1;
    });

    test(`Should error all package by username`, async () => {
      const inputUsername = 'user1';
      testObj.packageService.getAllByUsername.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringPackageService.getAllByUsername(inputUsername);

      testObj.packageService.getAllByUsername.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully all package by username`, async () => {
      const inputUsername = 'user1';
      const outputFetchModel1 = testObj.outputFetchModel1;
      testObj.packageService.getAllByUsername.resolves([null, [outputFetchModel1]]);

      const [error, result] = await testObj.fastspringPackageService.getAllByUsername(
        inputUsername,
      );

      testObj.packageService.getAllByUsername.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.an.instanceof(PackageModel);
      expect(result[0].countIp).to.be.equal(3);
    });
  });

  suite(`Check ip exist for create package for user`, () => {
    test(`Should error check ip exist for create package for user when execute`, async () => {
      const inputModel = new PackageModel();
      inputModel.userId = testObj.identifierGenerator.generateId();
      inputModel.countIp = 4;
      inputModel.proxyType = 'dc';
      inputModel.country = 'GB';
      testObj.packageService.checkIpExistForCreatePackage.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringPackageService.checkIpExistForCreatePackage(
        inputModel,
      );

      testObj.packageService.checkIpExistForCreatePackage.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully check ip exist for create package for user`, async () => {
      const inputModel = new PackageModel();
      inputModel.userId = testObj.identifierGenerator.generateId();
      inputModel.countIp = 4;
      inputModel.proxyType = 'dc';
      inputModel.country = 'GB';
      testObj.packageService.checkIpExistForCreatePackage.resolves([null]);

      const [error] = await testObj.fastspringPackageService.checkIpExistForCreatePackage(
        inputModel,
      );

      testObj.packageService.checkIpExistForCreatePackage.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });

  suite(`Add new package`, () => {
    test(`Should error add new package`, async () => {
      const inputModel = new PackageModel();
      testObj.packageService.add.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringPackageService.add(inputModel);

      testObj.packageService.add.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully add new package`, async () => {
      const inputModel = new PackageModel();
      const outputFetchModel = new PackageModel();
      testObj.packageService.add.resolves([null, outputFetchModel]);

      const [error, result] = await testObj.fastspringPackageService.add(inputModel);

      testObj.packageService.add.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(PackageModel);
    });
  });

  suite(`Renew expire date`, () => {
    test(`Should error renew expire date`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const inputExpireDate = new Date();
      testObj.packageService.renew.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringPackageService.renew(inputId, inputExpireDate);

      testObj.packageService.renew.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully renew expire date`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const inputExpireDate = new Date();
      testObj.packageService.renew.resolves([null]);

      const [error] = await testObj.fastspringPackageService.renew(inputId, inputExpireDate);

      testObj.packageService.renew.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });

  suite(`Cancel package`, () => {
    test(`Should error cancel package when order data`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.orderRepository.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringPackageService.cancel(inputId);

      testObj.orderRepository.getAll.should.have.callCount(1);
      testObj.orderRepository.getAll.should.have.calledWith(sinon.match.has('packageId', inputId));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error cancel package when get subscription info (if order has been founded)`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputOrderModel1 = new OrderModel();
      outputOrderModel1.id = testObj.identifierGenerator.generateId();
      outputOrderModel1.packageId = testObj.identifierGenerator.generateId();
      testObj.orderRepository.getAll.resolves([null, [outputOrderModel1]]);
      testObj.orderRepository.getAllSubscriptionByOrderId.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringPackageService.cancel(inputId);

      testObj.orderRepository.getAll.should.have.callCount(1);
      testObj.orderRepository.getAll.should.have.calledWith(sinon.match.has('packageId', inputId));
      testObj.orderRepository.getAllSubscriptionByOrderId.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error cancel package when get subscription info (if order has been founded)`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputOrderModel1 = new OrderModel();
      outputOrderModel1.id = testObj.identifierGenerator.generateId();
      outputOrderModel1.packageId = testObj.identifierGenerator.generateId();
      outputOrderModel1.prePackageOrderInfo = { expireDay: 30 };
      testObj.orderRepository.getAll.resolves([null, [outputOrderModel1]]);
      const outputSubscriptionModel1 = new SubscriptionModel();
      outputSubscriptionModel1.id = testObj.identifierGenerator.generateId();
      outputSubscriptionModel1.status = SubscriptionModel.STATUS_ACTIVATED;
      outputSubscriptionModel1.orderId = testObj.identifierGenerator.generateId();
      outputSubscriptionModel1.serial = 'subscription serial';
      testObj.orderRepository.getAllSubscriptionByOrderId.resolves([
        null,
        [outputSubscriptionModel1],
      ]);
      testObj.fastspringApiRepository.getSubscription.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringPackageService.cancel(inputId);

      testObj.orderRepository.getAll.should.have.callCount(1);
      testObj.orderRepository.getAll.should.have.calledWith(sinon.match.has('packageId', inputId));
      testObj.orderRepository.getAllSubscriptionByOrderId.should.have.callCount(1);
      testObj.fastspringApiRepository.getSubscription.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error cancel package when cancel subscription (if order has been founded)`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputOrderModel1 = new OrderModel();
      outputOrderModel1.id = testObj.identifierGenerator.generateId();
      outputOrderModel1.packageId = testObj.identifierGenerator.generateId();
      outputOrderModel1.prePackageOrderInfo = { expireDay: 30 };
      testObj.orderRepository.getAll.resolves([null, [outputOrderModel1]]);
      const outputSubscriptionModel1 = new SubscriptionModel();
      outputSubscriptionModel1.id = testObj.identifierGenerator.generateId();
      outputSubscriptionModel1.status = SubscriptionModel.STATUS_ACTIVATED;
      outputSubscriptionModel1.orderId = testObj.identifierGenerator.generateId();
      outputSubscriptionModel1.serial = 'subscription serial 1';
      const outputSubscriptionModel2 = new SubscriptionModel();
      outputSubscriptionModel2.id = testObj.identifierGenerator.generateId();
      outputSubscriptionModel2.status = SubscriptionModel.STATUS_ACTIVATED;
      outputSubscriptionModel2.orderId = testObj.identifierGenerator.generateId();
      outputSubscriptionModel2.serial = 'subscription serial 2';
      testObj.orderRepository.getAllSubscriptionByOrderId.resolves([
        null,
        [outputSubscriptionModel1, outputSubscriptionModel2],
      ]);
      const outputFetchSubscriptionModel1 = new SubscriptionModel();
      outputFetchSubscriptionModel1.serial = 'subscription serial 1';
      outputFetchSubscriptionModel1.status = SubscriptionModel.STATUS_CANCELED;
      const outputFetchSubscriptionModel2 = new SubscriptionModel();
      outputFetchSubscriptionModel2.serial = 'subscription serial 2';
      outputFetchSubscriptionModel2.status = SubscriptionModel.STATUS_ACTIVATED;
      testObj.fastspringApiRepository.getSubscription
        .onCall(0)
        .resolves([null, outputFetchSubscriptionModel1])
        .onCall(1)
        .resolves([null, outputFetchSubscriptionModel2]);
      testObj.fastspringApiRepository.cancelSubscription.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringPackageService.cancel(inputId);

      testObj.orderRepository.getAll.should.have.callCount(1);
      testObj.orderRepository.getAll.should.have.calledWith(sinon.match.has('packageId', inputId));
      testObj.orderRepository.getAllSubscriptionByOrderId.should.have.callCount(1);
      testObj.fastspringApiRepository.getSubscription.should.have.callCount(2);
      testObj.fastspringApiRepository.cancelSubscription.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error cancel package when cancel package (if not found order info)`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.orderRepository.getAll.resolves([null, []]);
      testObj.packageService.cancel.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringPackageService.cancel(inputId);

      testObj.orderRepository.getAll.should.have.callCount(1);
      testObj.orderRepository.getAll.should.have.calledWith(sinon.match.has('packageId', inputId));
      testObj.packageService.cancel.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error cancel package when update expire date (if order has been founded)`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputOrderModel1 = new OrderModel();
      outputOrderModel1.id = testObj.identifierGenerator.generateId();
      outputOrderModel1.packageId = testObj.identifierGenerator.generateId();
      outputOrderModel1.prePackageOrderInfo = { expireDay: 30 };
      testObj.orderRepository.getAll.resolves([null, [outputOrderModel1]]);
      const outputSubscriptionModel1 = new SubscriptionModel();
      outputSubscriptionModel1.id = testObj.identifierGenerator.generateId();
      outputSubscriptionModel1.status = SubscriptionModel.STATUS_ACTIVATED;
      outputSubscriptionModel1.orderId = testObj.identifierGenerator.generateId();
      outputSubscriptionModel1.serial = 'subscription serial';
      testObj.orderRepository.getAllSubscriptionByOrderId.resolves([
        null,
        [outputSubscriptionModel1],
      ]);
      const outputFetchSubscriptionModel = new SubscriptionModel();
      outputFetchSubscriptionModel.serial = 'subscription serial';
      outputFetchSubscriptionModel.status = SubscriptionModel.STATUS_ACTIVATED;
      testObj.fastspringApiRepository.getSubscription.resolves([
        null,
        outputFetchSubscriptionModel,
      ]);
      testObj.fastspringApiRepository.cancelSubscription.resolves([null]);
      testObj.packageService.cancel.resolves([null]);
      testObj.packageRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringPackageService.cancel(inputId);

      testObj.orderRepository.getAll.should.have.callCount(1);
      testObj.orderRepository.getAll.should.have.calledWith(sinon.match.has('packageId', inputId));
      testObj.orderRepository.getAllSubscriptionByOrderId.should.have.callCount(1);
      testObj.fastspringApiRepository.getSubscription.should.have.callCount(1);
      testObj.fastspringApiRepository.cancelSubscription.should.have.callCount(1);
      testObj.packageService.cancel.should.have.callCount(1);
      testObj.packageRepository.update.should.have.callCount(1);
      const expireDateCondition = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
      testObj.packageRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.identifierGenerator.generateId())
          .and(sinon.match.has('renewalDate', null))
          .and(sinon.match.has('expireDate', expireDateCondition)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully cancel package (if order has been founded)`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputOrderModel1 = new OrderModel();
      outputOrderModel1.id = testObj.identifierGenerator.generateId();
      outputOrderModel1.packageId = testObj.identifierGenerator.generateId();
      outputOrderModel1.prePackageOrderInfo = { expireDay: 30 };
      testObj.orderRepository.getAll.resolves([null, [outputOrderModel1]]);
      const outputSubscriptionModel1 = new SubscriptionModel();
      outputSubscriptionModel1.id = testObj.identifierGenerator.generateId();
      outputSubscriptionModel1.status = SubscriptionModel.STATUS_ACTIVATED;
      outputSubscriptionModel1.orderId = testObj.identifierGenerator.generateId();
      outputSubscriptionModel1.serial = 'subscription serial';
      testObj.orderRepository.getAllSubscriptionByOrderId.resolves([
        null,
        [outputSubscriptionModel1],
      ]);
      const outputFetchSubscriptionModel = new SubscriptionModel();
      outputFetchSubscriptionModel.serial = 'subscription serial';
      outputFetchSubscriptionModel.status = SubscriptionModel.STATUS_ACTIVATED;
      testObj.fastspringApiRepository.getSubscription.resolves([
        null,
        outputFetchSubscriptionModel,
      ]);
      testObj.fastspringApiRepository.cancelSubscription.resolves([null]);
      testObj.packageService.cancel.resolves([null]);
      testObj.packageRepository.update.resolves([null]);

      const [error] = await testObj.fastspringPackageService.cancel(inputId);

      testObj.orderRepository.getAll.should.have.callCount(1);
      testObj.orderRepository.getAll.should.have.calledWith(sinon.match.has('packageId', inputId));
      testObj.orderRepository.getAllSubscriptionByOrderId.should.have.callCount(1);
      testObj.fastspringApiRepository.getSubscription.should.have.callCount(1);
      testObj.fastspringApiRepository.cancelSubscription.should.have.callCount(1);
      testObj.packageService.cancel.should.have.callCount(1);
      testObj.packageRepository.update.should.have.callCount(1);
      const expireDateCondition = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
      testObj.packageRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.identifierGenerator.generateId())
          .and(sinon.match.has('renewalDate', null))
          .and(sinon.match.has('expireDate', expireDateCondition)),
      );
      expect(error).to.be.a('null');
    });
  });

  suite(`Disable expire package`, () => {
    test(`Should error disable expire package`, async () => {
      testObj.packageService.disableExpirePackage.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringPackageService.disableExpirePackage();

      testObj.packageService.disableExpirePackage.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully disable expire package`, async () => {
      testObj.packageService.disableExpirePackage.resolves([null, []]);

      const [error, result] = await testObj.fastspringPackageService.disableExpirePackage();

      testObj.packageService.disableExpirePackage.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result.length).to.be.equal(0);
    });
  });

  suite(`Remove package`, () => {
    test(`Should error remove package`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.packageService.remove.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringPackageService.remove(inputId);

      testObj.packageService.remove.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully remove package`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.packageService.remove.resolves([null]);

      const [error] = await testObj.fastspringPackageService.remove(inputId);

      testObj.packageService.remove.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });

  suite(`Sync package with id`, () => {
    test(`Should error sync package`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.packageService.syncPackageById.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringPackageService.syncPackageById(inputId);

      testObj.packageService.syncPackageById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successful sync package`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.packageService.syncPackageById.resolves([null]);

      const [error] = await testObj.fastspringPackageService.syncPackageById(inputId);

      testObj.packageService.syncPackageById.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });
});
