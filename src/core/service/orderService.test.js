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
const SubscriptionModel = require('~src/core/model/subscriptionModel');
const ExternalStoreModel = require('~src/core/model/externalStoreModel');
const UnknownException = require('~src/core/exception/unknownException');
const NotFoundException = require('~src/core/exception/notFoundException');
const ItemDisableException = require('~src/core/exception/itemDisableException');
const DisableUserException = require('~src/core/exception/disableUserException');
const AlreadyExpireException = require('~src/core/exception/alreadyExpireException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`OrderService`, () => {
  setup(() => {
    const { packageService, orderRepository, orderService } = helper.fakeOrderService();

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
    outputOrderModel.status = OrderModel.STATUS_SUCCESS;
    outputOrderModel.lastSubscriptionStatus = null;
    outputOrderModel.prePackageOrderInfo = { count: 3, proxyType: 'isp', countryCode: 'US' };
    outputOrderModel.insertDate = new Date();

    const outputSubscriptionModel = new SubscriptionModel();
    outputSubscriptionModel.id = testObj.identifierGenerator.generateId();
    outputSubscriptionModel.orderId = testObj.identifierGenerator.generateId();
    outputSubscriptionModel.status = SubscriptionModel.STATUS_ACTIVATED;
    outputSubscriptionModel.lastSubscriptionStatus = null;
    outputSubscriptionModel.insertDate = new Date();

    testObj.outputOrderModel = outputOrderModel;
    testObj.outputSubscriptionModel = outputSubscriptionModel;
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
});
