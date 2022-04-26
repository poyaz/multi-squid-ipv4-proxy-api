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

    testObj.outputModel = outputModel;
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
      const outputModel1 = testObj.outputModel;
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
      const outputModel = testObj.outputModel;
      testObj.orderRepository.getById.resolves([null, outputModel]);

      const [error, result] = await testObj.orderService.getById(inputId);

      testObj.orderRepository.getById.should.have.callCount(1);
      testObj.orderRepository.getById.should.have.calledWith(sinon.match(inputId));
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(OrderModel);
    });
  });
});
