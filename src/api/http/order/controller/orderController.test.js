/**
 * Created by pooya on 4/24/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const { createRequest, createResponse } = require('node-mocks-http');

const helper = require('~src/helper');

const OrderModel = require('~src/core/model/orderModel');
const SubscriptionModel = require('~src/core/model/subscriptionModel');
const ExternalStoreModel = require('~src/core/model/externalStoreModel');
const UnknownException = require('~src/core/exception/unknownException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
chai.use(chaiAsPromised);

const expect = chai.expect;
const testObj = {};

suite(`OrderController`, () => {
  setup(() => {
    testObj.req = new createRequest();
    testObj.res = new createResponse();

    const { orderService, dateTime, orderController } = helper.fakeOrderController(
      testObj.req,
      testObj.res,
    );

    testObj.orderService = orderService;
    testObj.dateTime = dateTime;
    testObj.orderController = orderController;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.dateRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/;
    testObj.token = /.+/;
  });

  suite(`Get all order for admin`, () => {
    test(`Should error get all order for admin`, async () => {
      testObj.orderService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.orderController.getAllOrderForAdmin();

      testObj.orderService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully get all order for admin`, async () => {
      const outputModel1 = new OrderModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.userId = testObj.identifierGenerator.generateId();
      outputModel1.productId = testObj.identifierGenerator.generateId();
      outputModel1.orderSerial = 'orderSerial';
      outputModel1.serviceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputModel1.status = OrderModel.STATUS_SUCCESS;
      outputModel1.lastSubscriptionStatus = null;
      outputModel1.prePackageOrderInfo = { count: 3, proxyType: 'isp', countryCode: 'US' };
      outputModel1.insertDate = new Date();
      testObj.orderService.getAll.resolves([null, [outputModel1]]);
      testObj.dateTime.gregorianWithTimezoneString.returns('date');

      const [error, result] = await testObj.orderController.getAllOrderForAdmin();

      testObj.orderService.getAll.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator.generateId(),
        productId: testObj.identifierGenerator.generateId(),
        packageId: null,
        orderSerial: 'orderSerial',
        serviceName: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        status: OrderModel.STATUS_SUCCESS,
        lastSubscriptionStatus: null,
        insertDate: 'date',
      });
      expect(result[0].prePackageOrderInfo).to.have.include({
        count: 3,
        proxyType: 'isp',
        countryCode: 'US',
      });
      expect(result[0].orderBodyData).to.be.a('undefined');
    });
  });

  suite(`Get all order for each user`, () => {
    test(`Should error get all order for each user`, async () => {
      testObj.req.params = { userId: testObj.identifierGenerator.generateId() };
      testObj.orderService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.orderController.getAllOrderForUser();

      testObj.orderService.getAll.should.have.callCount(1);
      testObj.orderService.getAll.should.have.calledWith(
        sinon.match
          .instanceOf(OrderModel)
          .and(sinon.match.has('userId', testObj.identifierGenerator.generateId())),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully get all order for each user`, async () => {
      testObj.req.params = { userId: testObj.identifierGenerator.generateId() };
      const outputModel1 = new OrderModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.userId = testObj.identifierGenerator.generateId();
      outputModel1.productId = testObj.identifierGenerator.generateId();
      outputModel1.orderSerial = 'orderSerial';
      outputModel1.serviceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputModel1.status = OrderModel.STATUS_SUCCESS;
      outputModel1.lastSubscriptionStatus = null;
      outputModel1.prePackageOrderInfo = { count: 3, proxyType: 'isp', countryCode: 'US' };
      outputModel1.insertDate = new Date();
      testObj.orderService.getAll.resolves([null, [outputModel1]]);
      testObj.dateTime.gregorianWithTimezoneString.returns('date');

      const [error, result] = await testObj.orderController.getAllOrderForUser();

      testObj.orderService.getAll.should.have.callCount(1);
      testObj.orderService.getAll.should.have.calledWith(
        sinon.match
          .instanceOf(OrderModel)
          .and(sinon.match.has('userId', testObj.identifierGenerator.generateId())),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator.generateId(),
        productId: testObj.identifierGenerator.generateId(),
        packageId: null,
        orderSerial: 'orderSerial',
        serviceName: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        status: OrderModel.STATUS_SUCCESS,
        lastSubscriptionStatus: null,
        insertDate: 'date',
      });
      expect(result[0].prePackageOrderInfo).to.have.include({
        count: 3,
        proxyType: 'isp',
        countryCode: 'US',
      });
      expect(result[0].orderBodyData).to.be.a('undefined');
    });
  });

  suite(`Get all subscriptions of order`, () => {
    test(`Should error get all subscriptions of order`, async () => {
      testObj.orderService.getAllSubscriptionByOrderId.resolves([new UnknownException()]);

      const [error] = await testObj.orderController.getAllSubscriptionOfOrder();

      testObj.orderService.getAllSubscriptionByOrderId.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully get all subscriptions of order`, async () => {
      const outputModel1 = new SubscriptionModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.orderId = testObj.identifierGenerator.generateId();
      outputModel1.status = SubscriptionModel.STATUS_ACTIVATED;
      outputModel1.lastSubscriptionStatus = null;
      outputModel1.insertDate = new Date();
      testObj.orderService.getAllSubscriptionByOrderId.resolves([null, [outputModel1]]);
      testObj.dateTime.gregorianWithTimezoneString.returns('date');

      const [error, result] = await testObj.orderController.getAllSubscriptionOfOrder();

      testObj.orderService.getAllSubscriptionByOrderId.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        orderId: testObj.identifierGenerator.generateId(),
        status: SubscriptionModel.STATUS_ACTIVATED,
        insertDate: 'date',
      });
      expect(result[0].subscriptionBodyData).to.be.a('undefined');
    });
  });

  suite(`Add new order`, () => {
    test(`Should error add new order`, async () => {
      testObj.req.params = { userId: testObj.identifierGenerator.generateId() };
      testObj.req.body = {
        serviceName: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        prePackageOrderInfo: {
          count: 3,
          proxyType: 'isp',
          countryCode: 'US',
        },
      };
      testObj.orderService.add.resolves([new UnknownException()]);

      const [error] = await testObj.orderController.addOrder();

      testObj.orderService.add.should.have.callCount(1);
      testObj.orderService.add.should.have.calledWith(
        sinon.match
          .instanceOf(OrderModel)
          .and(sinon.match.has('userId', testObj.identifierGenerator.generateId()))
          .and(sinon.match.has('serviceName', ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING))
          .and(sinon.match.hasNested('prePackageOrderInfo.count', 3))
          .and(sinon.match.hasNested('prePackageOrderInfo.proxyType', 'isp'))
          .and(sinon.match.hasNested('prePackageOrderInfo.countryCode', 'US')),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully add new order`, async () => {
      testObj.req.params = { userId: testObj.identifierGenerator.generateId() };
      testObj.req.body = {
        serviceName: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        prePackageOrderInfo: {
          count: 3,
          proxyType: 'isp',
          countryCode: 'US',
        },
      };
      const outputModel = new OrderModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.userId = testObj.identifierGenerator.generateId();
      outputModel.productId = testObj.identifierGenerator.generateId();
      outputModel.orderSerial = 'orderSerial';
      outputModel.serviceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputModel.status = OrderModel.STATUS_SUCCESS;
      outputModel.lastSubscriptionStatus = null;
      outputModel.prePackageOrderInfo = { count: 3, proxyType: 'isp', countryCode: 'US' };
      outputModel.insertDate = new Date();
      testObj.orderService.add.resolves([null, outputModel]);
      testObj.dateTime.gregorianWithTimezoneString.returns('date');

      const [error, result] = await testObj.orderController.addOrder();

      testObj.orderService.add.should.have.callCount(1);
      testObj.orderService.add.should.have.calledWith(
        sinon.match
          .instanceOf(OrderModel)
          .and(sinon.match.has('userId', testObj.identifierGenerator.generateId()))
          .and(sinon.match.has('serviceName', ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING))
          .and(sinon.match.hasNested('prePackageOrderInfo.count', 3))
          .and(sinon.match.hasNested('prePackageOrderInfo.proxyType', 'isp'))
          .and(sinon.match.hasNested('prePackageOrderInfo.countryCode', 'US')),
      );
      expect(error).to.be.a('null');
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator.generateId(),
        productId: testObj.identifierGenerator.generateId(),
        packageId: null,
        orderSerial: 'orderSerial',
        serviceName: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        status: OrderModel.STATUS_SUCCESS,
        lastSubscriptionStatus: null,
        insertDate: 'date',
      });
      expect(result.prePackageOrderInfo).to.have.include({
        count: 3,
        proxyType: 'isp',
        countryCode: 'US',
      });
      expect(result.orderBodyData).to.be.a('undefined');
    });
  });
});
