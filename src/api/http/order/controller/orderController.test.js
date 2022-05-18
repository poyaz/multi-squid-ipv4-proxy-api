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
const PackageModel = require('~src/core/model/packageModel');
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

    const {
      orderService,
      orderParserService,
      dateTime,
      orderController,
    } = helper.fakeOrderController(testObj.req, testObj.res);

    testObj.orderService = orderService;
    testObj.orderParserService = orderParserService;
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
      outputModel1.invoice = 'invoice';
      outputModel1.prePackageOrderInfo = {
        count: 3,
        expireDay: 3,
        proxyType: 'isp',
        countryCode: 'US',
      };
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
        invoice: 'invoice',
        insertDate: 'date',
      });
      expect(result[0].prePackageOrderInfo).to.have.include({
        count: 3,
        expireDay: 3,
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
      outputModel1.invoice = 'invoice';
      outputModel1.prePackageOrderInfo = {
        count: 3,
        expireDay: 3,
        proxyType: 'isp',
        countryCode: 'US',
      };
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
        invoice: 'invoice',
        insertDate: 'date',
      });
      expect(result[0].prePackageOrderInfo).to.have.include({
        count: 3,
        expireDay: 3,
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
      outputModel1.serial = 'serial';
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
        serial: 'serial',
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
        productId: testObj.identifierGenerator.generateId(),
        serviceName: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        prePackageOrderInfo: {
          count: 3,
          expireDay: 3,
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
          .and(sinon.match.has('productId', testObj.identifierGenerator.generateId()))
          .and(sinon.match.has('serviceName', ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING))
          .and(sinon.match.hasNested('prePackageOrderInfo.proxyType', 'isp'))
          .and(sinon.match.hasNested('prePackageOrderInfo.countryCode', 'US')),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully add new order`, async () => {
      testObj.req.params = { userId: testObj.identifierGenerator.generateId() };
      testObj.req.body = {
        productId: testObj.identifierGenerator.generateId(),
        serviceName: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        prePackageOrderInfo: {
          count: 3,
          expireDay: 3,
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
      outputModel.invoice = 'invoice';
      outputModel.prePackageOrderInfo = {
        count: 3,
        expireDay: 3,
        proxyType: 'isp',
        countryCode: 'US',
      };
      outputModel.insertDate = new Date();
      testObj.orderService.add.resolves([null, outputModel]);
      testObj.dateTime.gregorianWithTimezoneString.returns('date');

      const [error, result] = await testObj.orderController.addOrder();

      testObj.orderService.add.should.have.callCount(1);
      testObj.orderService.add.should.have.calledWith(
        sinon.match
          .instanceOf(OrderModel)
          .and(sinon.match.has('productId', testObj.identifierGenerator.generateId()))
          .and(sinon.match.has('userId', testObj.identifierGenerator.generateId()))
          .and(sinon.match.has('serviceName', ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING))
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
        invoice: 'invoice',
        insertDate: 'date',
      });
      expect(result.prePackageOrderInfo).to.have.include({
        count: 3,
        expireDay: 3,
        proxyType: 'isp',
        countryCode: 'US',
      });
      expect(result.orderBodyData).to.be.a('undefined');
    });
  });

  suite(`Verify order`, () => {
    test(`Should error verify order`, async () => {
      testObj.req.params = { orderId: testObj.identifierGenerator.generateId() };
      testObj.req.body = { orderSerial: 'orderSerial' };
      testObj.orderService.verifyOrderPackage.resolves([new UnknownException()]);

      const [error] = await testObj.orderController.verifyOrderPackage();

      testObj.orderService.verifyOrderPackage.should.have.callCount(1);
      testObj.orderService.verifyOrderPackage.should.have.calledWith(
        sinon.match
          .instanceOf(OrderModel)
          .and(sinon.match.has('id', testObj.identifierGenerator.generateId()))
          .and(sinon.match.has('orderSerial', 'orderSerial')),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully verify order`, async () => {
      testObj.req.params = { orderId: testObj.identifierGenerator.generateId() };
      testObj.req.body = { orderSerial: 'orderSerial' };
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
      testObj.orderService.verifyOrderPackage.resolves([null, outputPackageModel]);
      testObj.dateTime.gregorianWithTimezoneString.returns('date');

      const [error, result] = await testObj.orderController.verifyOrderPackage();

      testObj.orderService.verifyOrderPackage.should.have.callCount(1);
      testObj.orderService.verifyOrderPackage.should.have.calledWith(
        sinon.match
          .instanceOf(OrderModel)
          .and(sinon.match.has('id', testObj.identifierGenerator.generateId()))
          .and(sinon.match.has('orderSerial', 'orderSerial')),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.a('object');
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator.generateId(),
        username: 'user1',
        password: 'pass1',
        countIp: 1,
        type: 'isp',
        country: 'GB',
        status: PackageModel.STATUS_ENABLE,
        insertDate: 'date',
      });
      expect(result.ipList[0]).to.have.include({
        ip: '192.168.1.4',
        port: 8080,
      });
      expect(result.expireDate).to.be.a('null');
    });
  });

  suite(`Process order`, () => {
    test(`Should error process order`, async () => {
      testObj.req.params = { paymentService: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING };
      testObj.req.body = { events: [] };
      testObj.orderParserService.parse.resolves([new UnknownException()]);

      const [error] = await testObj.orderController.processOrder();

      testObj.orderParserService.parse.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully process order`, async () => {
      testObj.req.params = { paymentService: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING };
      testObj.req.body = { events: [] };
      testObj.orderParserService.parse.resolves([null]);

      const [error] = await testObj.orderController.processOrder();

      testObj.orderParserService.parse.should.have.callCount(1);
      testObj.orderParserService.parse.should.have.calledWith(
        sinon.match(testObj.req.params.paymentService),
        sinon.match(testObj.req.body),
      );
      expect(error).to.be.a('null');
    });
  });
});
