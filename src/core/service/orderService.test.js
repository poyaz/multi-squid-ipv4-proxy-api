/**
 * Created by pooya on 4/25/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const OrderModel = require('~src/core/model/orderModel');
const PackageModel = require('~src/core/model/packageModel');
const ProductModel = require('~src/core/model/productModel');
const SubscriptionModel = require('~src/core/model/subscriptionModel');
const ExternalStoreModel = require('~src/core/model/externalStoreModel');
const UnknownException = require('~src/core/exception/unknownException');
const NotFoundException = require('~src/core/exception/notFoundException');
const ItemDisableException = require('~src/core/exception/itemDisableException');
const AlreadyExistException = require('~src/core/exception/alreadyExistException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`OrderService`, () => {
  setup(() => {
    const {
      productService,
      packageService,
      orderRepository,
      orderService,
    } = helper.fakeOrderService();

    testObj.productService = productService;
    testObj.packageService = packageService;
    testObj.orderRepository = orderRepository;
    testObj.orderService = orderService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    const outputOrderModel = new OrderModel();
    outputOrderModel.id = testObj.identifierGenerator.generateId();
    outputOrderModel.userId = testObj.identifierGenerator.generateId();
    outputOrderModel.productId = testObj.identifierGenerator.generateId();
    outputOrderModel.orderSerial = 'orderSerial';
    outputOrderModel.serviceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
    outputOrderModel.username = 'user1';
    outputOrderModel.status = OrderModel.STATUS_SUCCESS;
    outputOrderModel.lastSubscriptionStatus = null;
    outputOrderModel.prePackageOrderInfo = {
      count: 3,
      expireDay: 3,
      proxyType: 'isp',
      countryCode: 'US',
    };
    outputOrderModel.insertDate = new Date();

    const outputSubscriptionModel = new SubscriptionModel();
    outputSubscriptionModel.id = testObj.identifierGenerator.generateId();
    outputSubscriptionModel.orderId = testObj.identifierGenerator.generateId();
    outputSubscriptionModel.status = SubscriptionModel.STATUS_ACTIVATED;
    outputSubscriptionModel.lastSubscriptionStatus = null;
    outputSubscriptionModel.insertDate = new Date();

    testObj.outputOrderModel = outputOrderModel;
    testObj.outputSubscriptionModel = outputSubscriptionModel;

    testObj.clock = sinon.useFakeTimers({
      now: new Date(2019, 1, 1, 0, 0),
      shouldAdvanceTime: true,
      advanceTimeDelta: 20,
    });
  });

  teardown(() => {
    testObj.clock.restore();
  });

  suite(`Get order info by orderSerial`, () => {
    test(`Should error get order info by orderSerial`, async () => {
      const inputOrderSerial = 'orderSerial';
      testObj.orderRepository.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.orderService.getByOrderSerial(inputOrderSerial);

      testObj.orderRepository.getAll.should.have.callCount(1);
      testObj.orderRepository.getAll.should.have.calledWith(
        sinon.match.instanceOf(OrderModel).and(sinon.match.has('orderSerial', inputOrderSerial)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error get order info by orderSerial when can't found record`, async () => {
      const inputOrderSerial = 'orderSerial';
      testObj.orderRepository.getAll.resolves([null, []]);

      const [error] = await testObj.orderService.getByOrderSerial(inputOrderSerial);

      testObj.orderRepository.getAll.should.have.callCount(1);
      testObj.orderRepository.getAll.should.have.calledWith(
        sinon.match.instanceOf(OrderModel).and(sinon.match.has('orderSerial', inputOrderSerial)),
      );
      expect(error).to.be.an.instanceof(NotFoundException);
      expect(error).to.have.property('httpCode', 404);
    });

    test(`Should successfully get order info by orderSerial`, async () => {
      const inputOrderSerial = 'orderSerial';
      const outputModel1 = testObj.outputOrderModel;
      testObj.orderRepository.getAll.resolves([null, [outputModel1]]);

      const [error, result] = await testObj.orderService.getByOrderSerial(inputOrderSerial);

      testObj.orderRepository.getAll.should.have.callCount(1);
      testObj.orderRepository.getAll.should.have.calledWith(
        sinon.match.instanceOf(OrderModel).and(sinon.match.has('orderSerial', inputOrderSerial)),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(OrderModel);
    });
  });

  suite(`Get order by id`, () => {
    test(`Should error get order by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.orderRepository.getById.resolves([new UnknownException()]);

      const [error] = await testObj.orderService.getById(inputId);

      testObj.orderRepository.getById.should.have.callCount(1);
      testObj.orderRepository.getById.should.have.calledWith(sinon.match(inputId));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error get order by id when can't found record`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.orderRepository.getById.resolves([null, null]);

      const [error] = await testObj.orderService.getById(inputId);

      testObj.orderRepository.getById.should.have.callCount(1);
      testObj.orderRepository.getById.should.have.calledWith(sinon.match(inputId));
      expect(error).to.be.an.instanceof(NotFoundException);
      expect(error).to.have.property('httpCode', 404);
    });

    test(`Should successfully get order by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputModel = testObj.outputOrderModel;
      testObj.orderRepository.getById.resolves([null, outputModel]);

      const [error, result] = await testObj.orderService.getById(inputId);

      testObj.orderRepository.getById.should.have.callCount(1);
      testObj.orderRepository.getById.should.have.calledWith(sinon.match(inputId));
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(OrderModel);
    });
  });

  suite(`Get subscription order by id`, () => {
    test(`Should error get subscription order by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.orderRepository.getSubscriptionById.resolves([new UnknownException()]);

      const [error] = await testObj.orderService.getSubscriptionById(inputId);

      testObj.orderRepository.getSubscriptionById.should.have.callCount(1);
      testObj.orderRepository.getSubscriptionById.should.have.calledWith(sinon.match(inputId));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error get subscription order by id when can't found record`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.orderRepository.getSubscriptionById.resolves([null, null]);

      const [error] = await testObj.orderService.getSubscriptionById(inputId);

      testObj.orderRepository.getSubscriptionById.should.have.callCount(1);
      testObj.orderRepository.getSubscriptionById.should.have.calledWith(sinon.match(inputId));
      expect(error).to.be.an.instanceof(NotFoundException);
      expect(error).to.have.property('httpCode', 404);
    });

    test(`Should successfully get subscription order by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputModel = testObj.outputSubscriptionModel;
      testObj.orderRepository.getSubscriptionById.resolves([null, outputModel]);

      const [error, result] = await testObj.orderService.getSubscriptionById(inputId);

      testObj.orderRepository.getSubscriptionById.should.have.callCount(1);
      testObj.orderRepository.getSubscriptionById.should.have.calledWith(sinon.match(inputId));
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(SubscriptionModel);
    });
  });

  suite(`Get all subscription order by order id`, () => {
    test(`Should error all subscription order by order id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.orderRepository.getAllSubscriptionByOrderId.resolves([new UnknownException()]);

      const [error] = await testObj.orderService.getAllSubscriptionByOrderId(inputId);

      testObj.orderRepository.getAllSubscriptionByOrderId.should.have.callCount(1);
      testObj.orderRepository.getAllSubscriptionByOrderId.should.have.calledWith(
        sinon.match(inputId),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully all subscription order by order id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputModel1 = testObj.outputSubscriptionModel;
      testObj.orderRepository.getAllSubscriptionByOrderId.resolves([null, [outputModel1]]);

      const [error, result] = await testObj.orderService.getAllSubscriptionByOrderId(inputId);

      testObj.orderRepository.getAllSubscriptionByOrderId.should.have.callCount(1);
      testObj.orderRepository.getAllSubscriptionByOrderId.should.have.calledWith(
        sinon.match(inputId),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.an.instanceof(SubscriptionModel);
    });
  });

  suite(`Get all order`, () => {
    test(`Should error all order`, async () => {
      const inputFilterModel = new OrderModel();
      testObj.orderRepository.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.orderService.getAll(inputFilterModel);

      testObj.orderRepository.getAll.should.have.callCount(1);
      testObj.orderRepository.getAll.should.have.calledWith(sinon.match.instanceOf(OrderModel));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully all order`, async () => {
      const inputFilterModel = new OrderModel();
      const outputModel1 = testObj.outputOrderModel;
      testObj.orderRepository.getAll.resolves([null, [outputModel1]]);

      const [error, result] = await testObj.orderService.getAll(inputFilterModel);

      testObj.orderRepository.getAll.should.have.callCount(1);
      testObj.orderRepository.getAll.should.have.calledWith(sinon.match.instanceOf(OrderModel));
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.an.instanceof(OrderModel);
    });
  });

  suite(`Add new order`, () => {
    setup(() => {
      const inputModel = new OrderModel();
      inputModel.userId = testObj.identifierGenerator.generateId();
      inputModel.productId = testObj.identifierGenerator.generateId();
      inputModel.serviceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      inputModel.prePackageOrderInfo = {
        proxyType: 'isp',
        countryCode: 'US',
      };

      testObj.inputModel = inputModel;
    });

    test(`Should error add new order when get product info`, async () => {
      const inputModel = testObj.inputModel;
      testObj.productService.getById.resolves([new UnknownException()]);

      const [error] = await testObj.orderService.add(inputModel);

      testObj.productService.getById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error add new order when product is disable`, async () => {
      const inputModel = testObj.inputModel;
      const outputProductModel = new ProductModel();
      outputProductModel.id = testObj.identifierGenerator.generateId();
      outputProductModel.isEnable = false;
      testObj.productService.getById.resolves([null, outputProductModel]);

      const [error] = await testObj.orderService.add(inputModel);

      testObj.productService.getById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(ItemDisableException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error add new order`, async () => {
      const inputModel = testObj.inputModel;
      const outputProductModel = new ProductModel();
      outputProductModel.id = testObj.identifierGenerator.generateId();
      outputProductModel.count = 3;
      outputProductModel.expireDay = 30;
      outputProductModel.isEnable = true;
      testObj.productService.getById.resolves([null, outputProductModel]);
      testObj.orderRepository.add.resolves([new UnknownException()]);

      const [error] = await testObj.orderService.add(inputModel);

      testObj.productService.getById.should.have.callCount(1);
      testObj.orderRepository.add.should.have.callCount(1);
      testObj.orderRepository.add.should.have.calledWith(
        sinon.match
          .instanceOf(OrderModel)
          .and(sinon.match.hasNested('prePackageOrderInfo.count', 3))
          .and(sinon.match.hasNested('prePackageOrderInfo.expireDay', 30)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully add new order`, async () => {
      const inputModel = testObj.inputModel;
      const outputProductModel = new ProductModel();
      outputProductModel.id = testObj.identifierGenerator.generateId();
      outputProductModel.count = 3;
      outputProductModel.expireDay = 30;
      outputProductModel.isEnable = true;
      testObj.productService.getById.resolves([null, outputProductModel]);
      const outputModel = testObj.outputOrderModel;
      testObj.orderRepository.add.resolves([null, outputModel]);

      const [error, result] = await testObj.orderService.add(inputModel);

      testObj.productService.getById.should.have.callCount(1);
      testObj.orderRepository.add.should.have.callCount(1);
      testObj.orderRepository.add.should.have.calledWith(
        sinon.match
          .instanceOf(OrderModel)
          .and(sinon.match.hasNested('prePackageOrderInfo.count', 3))
          .and(sinon.match.hasNested('prePackageOrderInfo.expireDay', 30)),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(OrderModel);
    });
  });

  suite(`Add new subscription order`, () => {
    setup(() => {
      const inputModel = new SubscriptionModel();
      inputModel.orderId = testObj.identifierGenerator.generateId();
      inputModel.status = SubscriptionModel.STATUS_ACTIVATED;

      testObj.inputModel = inputModel;
    });

    test(`Should error add new subscription order`, async () => {
      const inputModel = testObj.inputModel;
      testObj.orderRepository.addSubscription.resolves([new UnknownException()]);

      const [error] = await testObj.orderService.addSubscription(inputModel);

      testObj.orderRepository.addSubscription.should.have.callCount(1);
      testObj.orderRepository.addSubscription.should.have.calledWith(
        sinon.match.instanceOf(SubscriptionModel),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully add new subscription order`, async () => {
      const inputModel = testObj.inputModel;
      const outputModel = testObj.outputSubscriptionModel;
      testObj.orderRepository.addSubscription.resolves([null, outputModel]);

      const [error, result] = await testObj.orderService.addSubscription(inputModel);

      testObj.orderRepository.addSubscription.should.have.callCount(1);
      testObj.orderRepository.addSubscription.should.have.calledWith(
        sinon.match.instanceOf(SubscriptionModel),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(SubscriptionModel);
    });
  });

  suite(`Verify order package`, () => {
    setup(() => {
      const inputModel = new OrderModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.orderSerial = 'orderSerial';

      const outputPackageModel = new PackageModel();
      outputPackageModel.id = testObj.identifierGenerator.generateId();
      outputPackageModel.userId = testObj.identifierGenerator.generateId();
      outputPackageModel.username = 'user1';
      outputPackageModel.password = 'pass1';
      outputPackageModel.countIp = 1;
      outputPackageModel.type = 'isp';
      outputPackageModel.country = 'GB';
      outputPackageModel.ipList = [{ ip: '192.168.1.4', port: 8080 }];
      outputPackageModel.status = PackageModel.STATUS_ENABLE;
      outputPackageModel.insertDate = new Date();
      testObj.packageService.getById.resolves([null, outputPackageModel]);

      testObj.inputModel = inputModel;
      testObj.outputPackageModel = outputPackageModel;

      testObj.orderServiceGetById = sinon.stub(testObj.orderService, 'getById');
      testObj.consoleError = sinon.stub(console, 'error');
    });

    teardown(() => {
      testObj.orderServiceGetById.restore();
      testObj.consoleError.restore();
    });

    test(`Should error verify order package when fetch order info`, async () => {
      const inputModel = testObj.inputModel;
      testObj.orderServiceGetById.resolves([new UnknownException()]);

      const [error] = await testObj.orderService.verifyOrderPackage(inputModel);

      testObj.orderServiceGetById.should.have.callCount(1);
      testObj.orderServiceGetById.should.have.calledWith(sinon.match(inputModel.id));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error verify order package when fetch package info (if packageId exist)`, async () => {
      const inputModel = testObj.inputModel;
      const outputOrderModel = testObj.outputOrderModel;
      outputOrderModel.packageId = testObj.identifierGenerator.generateId();
      testObj.orderServiceGetById.resolves([null, outputOrderModel]);
      testObj.packageService.getById.resolves([new UnknownException()]);

      const [error] = await testObj.orderService.verifyOrderPackage(inputModel);

      testObj.orderServiceGetById.should.have.callCount(1);
      testObj.orderServiceGetById.should.have.calledWith(sinon.match(inputModel.id));
      testObj.packageService.getById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully verify order package when fetch package info (if packageId exist)`, async () => {
      const inputModel = testObj.inputModel;
      const outputOrderModel = testObj.outputOrderModel;
      outputOrderModel.packageId = testObj.identifierGenerator.generateId();
      testObj.orderServiceGetById.resolves([null, outputOrderModel]);
      const outputPackageModel = testObj.outputPackageModel;
      testObj.packageService.getById.resolves([null, outputPackageModel]);

      const [error, result] = await testObj.orderService.verifyOrderPackage(inputModel);

      testObj.orderServiceGetById.should.have.callCount(1);
      testObj.orderServiceGetById.should.have.calledWith(sinon.match(inputModel.id));
      testObj.packageService.getById.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(PackageModel);
    });

    test(`Should error verify order package when create package (if orderSerial already exist and status not empty)`, async () => {
      const inputModel = testObj.inputModel;
      const outputOrderModel = testObj.outputOrderModel;
      outputOrderModel.status = OrderModel.STATUS_SUCCESS;
      testObj.orderServiceGetById.resolves([null, outputOrderModel]);
      testObj.packageService.add.resolves([new UnknownException()]);

      const [error] = await testObj.orderService.verifyOrderPackage(inputModel);

      testObj.orderServiceGetById.should.have.callCount(1);
      testObj.orderServiceGetById.should.have.calledWith(sinon.match(inputModel.id));
      expect(error).to.be.an.instanceof(AlreadyExistException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error verify order package when change order status`, async () => {
      const inputModel = testObj.inputModel;
      const outputOrderModel = testObj.outputOrderModel;
      delete outputOrderModel.status;
      testObj.orderServiceGetById.resolves([null, outputOrderModel]);
      testObj.orderRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.orderService.verifyOrderPackage(inputModel);

      testObj.orderServiceGetById.should.have.callCount(1);
      testObj.orderServiceGetById.should.have.calledWith(sinon.match(inputModel.id));
      testObj.orderRepository.update.should.have.callCount(1);
      testObj.orderRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.identifierGenerator.generateId())
          .and(sinon.match.has('orderSerial', 'orderSerial'))
          .and(sinon.match.has('status', OrderModel.STATUS_SUCCESS)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error verify order package when create package`, async () => {
      const inputModel = testObj.inputModel;
      const outputOrderModel = testObj.outputOrderModel;
      delete outputOrderModel.status;
      testObj.orderServiceGetById.resolves([null, outputOrderModel]);
      testObj.orderRepository.update.resolves([null]);
      testObj.packageService.add.resolves([new UnknownException()]);

      const [error] = await testObj.orderService.verifyOrderPackage(inputModel);

      testObj.orderServiceGetById.should.have.callCount(1);
      testObj.orderServiceGetById.should.have.calledWith(sinon.match(inputModel.id));
      testObj.orderRepository.update.should.have.callCount(1);
      testObj.orderRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.identifierGenerator.generateId())
          .and(sinon.match.has('orderSerial', 'orderSerial'))
          .and(sinon.match.has('status', OrderModel.STATUS_SUCCESS)),
      );
      testObj.packageService.add.should.have.callCount(1);
      const renewalDateCondition = new Date(
        new Date().getTime() + outputOrderModel.prePackageOrderInfo.expireDay * 24 * 60 * 60 * 1000,
      );
      testObj.packageService.add.should.have.calledWith(
        sinon.match
          .has('userId', testObj.identifierGenerator.generateId())
          .and(sinon.match.has('username', 'user1'))
          .and(sinon.match.has('countIp', 3))
          .and(sinon.match.has('type', 'isp'))
          .and(sinon.match.has('country', 'US'))
          .and(sinon.match.has('renewalDate', renewalDateCondition)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully verify order package`, async () => {
      const inputModel = testObj.inputModel;
      const outputOrderModel = testObj.outputOrderModel;
      delete outputOrderModel.status;
      testObj.orderServiceGetById.resolves([null, outputOrderModel]);
      testObj.orderRepository.update.resolves([null]);
      const outputPackageModel = testObj.outputPackageModel;
      testObj.packageService.add.resolves([null, outputPackageModel]);

      const [error, result] = await testObj.orderService.verifyOrderPackage(inputModel);

      testObj.orderServiceGetById.should.have.callCount(1);
      testObj.orderServiceGetById.should.have.calledWith(sinon.match(inputModel.id));
      testObj.orderRepository.update.should.have.callCount(2);
      const sinonMatch0 = sinon.match
        .has('id', testObj.identifierGenerator.generateId())
        .and(sinon.match.has('orderSerial', 'orderSerial'))
        .and(sinon.match.has('status', OrderModel.STATUS_SUCCESS));
      testObj.orderRepository.update.getCall(0).should.have.calledWith(sinonMatch0);
      testObj.packageService.add.should.have.callCount(1);
      const renewalDateCondition = new Date(
        new Date().getTime() + outputOrderModel.prePackageOrderInfo.expireDay * 24 * 60 * 60 * 1000,
      );
      testObj.packageService.add.should.have.calledWith(
        sinon.match
          .has('userId', testObj.identifierGenerator.generateId())
          .and(sinon.match.has('username', 'user1'))
          .and(sinon.match.has('countIp', 3))
          .and(sinon.match.has('type', 'isp'))
          .and(sinon.match.has('country', 'US'))
          .and(sinon.match.has('renewalDate', renewalDateCondition)),
      );
      const sinonMatch1 = sinon.match
        .has('id', testObj.identifierGenerator.generateId())
        .and(sinon.match.has('packageId', testObj.outputPackageModel.id));
      testObj.orderRepository.update.getCall(1).should.have.calledWith(sinonMatch1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(PackageModel);
    });

    test(`Should successfully verify order package but has fail when connect package to order`, async () => {
      const inputModel = testObj.inputModel;
      const outputOrderModel = testObj.outputOrderModel;
      delete outputOrderModel.status;
      testObj.orderServiceGetById.resolves([null, outputOrderModel]);
      testObj.orderRepository.update
        .onCall(0)
        .resolves([null])
        .onCall(1)
        .resolves([new UnknownException()]);
      const outputPackageModel = testObj.outputPackageModel;
      testObj.packageService.add.resolves([null, outputPackageModel]);

      const [error, result] = await testObj.orderService.verifyOrderPackage(inputModel);

      testObj.orderServiceGetById.should.have.callCount(1);
      testObj.orderServiceGetById.should.have.calledWith(sinon.match(inputModel.id));
      testObj.orderRepository.update.should.have.callCount(2);
      const sinonMatch0 = sinon.match
        .has('id', testObj.identifierGenerator.generateId())
        .and(sinon.match.has('orderSerial', 'orderSerial'))
        .and(sinon.match.has('status', OrderModel.STATUS_SUCCESS));
      testObj.orderRepository.update.getCall(0).should.have.calledWith(sinonMatch0);
      testObj.packageService.add.should.have.callCount(1);
      const renewalDateCondition = new Date(
        new Date().getTime() + outputOrderModel.prePackageOrderInfo.expireDay * 24 * 60 * 60 * 1000,
      );
      testObj.packageService.add.should.have.calledWith(
        sinon.match
          .has('userId', testObj.identifierGenerator.generateId())
          .and(sinon.match.has('username', 'user1'))
          .and(sinon.match.has('countIp', 3))
          .and(sinon.match.has('type', 'isp'))
          .and(sinon.match.has('country', 'US'))
          .and(sinon.match.has('renewalDate', renewalDateCondition)),
      );
      const sinonMatch1 = sinon.match
        .has('id', testObj.identifierGenerator.generateId())
        .and(sinon.match.has('packageId', testObj.outputPackageModel.id));
      testObj.orderRepository.update.getCall(1).should.have.calledWith(sinonMatch1);
      testObj.consoleError.should.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(PackageModel);
    });
  });
});
