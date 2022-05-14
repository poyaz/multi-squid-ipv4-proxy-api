/**
 * Created by pooya on 4/30/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const axios = require('axios');
const axiosGetStub = sinon.stub(axios, 'get');
const axiosPostStub = sinon.stub(axios, 'post');
const axiosPutStub = sinon.stub(axios, 'put');
const axiosDeleteStub = sinon.stub(axios, 'delete');

const helper = require('~src/helper');

const OrderModel = require('~src/core/model/orderModel');
const SubscriptionModel = require('~src/core/model/subscriptionModel');
const ExternalStoreModel = require('~src/core/model/externalStoreModel');
const ApiCallException = require('~src/core/exception/apiCallException');
const UnknownException = require('~src/core/exception/unknownException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

/**
 * @property eventually
 * @property rejectedWith
 */
const expect = chai.expect;
const testObj = {};

suite(`OrderFastspringApiRepository`, () => {
  setup(() => {
    const {
      orderRepository,
      fastspringApiRepository,
      orderFastspringApiRepository,
    } = helper.fakeOrderFastspringApiRepository();

    testObj.orderRepository = orderRepository;
    testObj.fastspringApiRepository = fastspringApiRepository;
    testObj.orderFastspringApiRepository = orderFastspringApiRepository;

    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
    testObj.identifierGenerator1 = helper.fakeIdentifierGenerator('id-1');
    testObj.identifierGenerator2 = helper.fakeIdentifierGenerator('id-2');
    testObj.identifierGenerator3 = helper.fakeIdentifierGenerator('id-3');
    testObj.consoleError = sinon.stub(console, 'error');
  });

  teardown(() => {
    axiosGetStub.resetHistory();
    axiosPostStub.resetHistory();
    axiosPutStub.resetHistory();
    axiosDeleteStub.resetHistory();
    testObj.consoleError.restore();
  });

  suite(`Get order by id`, () => {
    test(`Should error get order by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.orderRepository.getById.resolves([new UnknownException()]);

      const [error] = await testObj.orderFastspringApiRepository.getById(inputId);

      testObj.orderRepository.getById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error get order by id when order find and error on get info from API`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputModel = new OrderModel();
      outputModel.orderSerial = 'order serial';
      testObj.orderRepository.getById.resolves([null, outputModel]);
      testObj.fastspringApiRepository.getOrder.resolves([new UnknownException()]);

      const [error] = await testObj.orderFastspringApiRepository.getById(inputId);

      testObj.orderRepository.getById.should.have.callCount(1);
      testObj.fastspringApiRepository.getOrder.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully get order by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputModel = new OrderModel();
      outputModel.orderSerial = 'order serial';
      testObj.orderRepository.getById.resolves([null, outputModel]);
      testObj.fastspringApiRepository.getOrder.resolves([null]);

      const [error, result] = await testObj.orderFastspringApiRepository.getById(inputId);

      testObj.orderRepository.getById.should.have.callCount(1);
      testObj.fastspringApiRepository.getOrder.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(OrderModel);
    });
  });

  suite(`Get all order`, () => {
    test(`Should error get all order`, async () => {
      const inputFilter = new OrderModel();
      testObj.orderRepository.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.orderFastspringApiRepository.getAll(inputFilter);

      testObj.orderRepository.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully get all order`, async () => {
      const inputFilter = new OrderModel();
      const outputModel1 = new OrderModel();
      testObj.orderRepository.getAll.resolves([null, [outputModel1]]);

      const [error, result] = await testObj.orderFastspringApiRepository.getAll(inputFilter);

      testObj.orderRepository.getAll.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.instanceOf(OrderModel);
    });
  });

  suite(`Get subscription order by id`, () => {
    test(`Should error get subscription order by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.orderRepository.getSubscriptionById.resolves([new UnknownException()]);

      const [error] = await testObj.orderFastspringApiRepository.getSubscriptionById(inputId);

      testObj.orderRepository.getSubscriptionById.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully get subscription order by id and return null`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputModel = new SubscriptionModel();
      testObj.orderRepository.getSubscriptionById.resolves([null, outputModel]);

      const [error, result] = await testObj.orderFastspringApiRepository.getSubscriptionById(
        inputId,
      );

      testObj.orderRepository.getSubscriptionById.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(SubscriptionModel);
    });
  });

  suite(`Get all subscription order by order id`, () => {
    test(`Should error get all subscription order by order id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.orderRepository.getAllSubscriptionByOrderId.resolves([new UnknownException()]);

      const [error] = await testObj.orderFastspringApiRepository.getAllSubscriptionByOrderId(
        inputId,
      );

      testObj.orderRepository.getAllSubscriptionByOrderId.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully get all subscription order by order id and return null`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputModel1 = new SubscriptionModel();
      testObj.orderRepository.getAllSubscriptionByOrderId.resolves([null, [outputModel1]]);

      const [
        error,
        result,
      ] = await testObj.orderFastspringApiRepository.getAllSubscriptionByOrderId(inputId);

      testObj.orderRepository.getAllSubscriptionByOrderId.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.instanceOf(SubscriptionModel);
    });
  });

  suite(`Add new order`, () => {
    setup(() => {
      const inputModel = new OrderModel();
      inputModel.userId = testObj.identifierGenerator1.generateId();
      inputModel.productId = testObj.identifierGenerator2.generateId();
      inputModel.packageId = testObj.identifierGenerator3.generateId();
      inputModel.orderSerial = 'orderSerial';
      inputModel.serviceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      inputModel.status = OrderModel.STATUS_SUCCESS;
      inputModel.prePackageOrderInfo = {
        count: 3,
        proxyType: 'isp',
        countryCode: 'GB',
      };
      inputModel.orderBodyData = '{}';

      testObj.inputModel = inputModel;
    });

    test(`Should error add new order in database (when input orderSerial empty)`, async () => {
      const inputModel = testObj.inputModel;
      delete inputModel.orderSerial;
      testObj.orderRepository.add.resolves([new UnknownException()]);

      const [error] = await testObj.orderFastspringApiRepository.add(inputModel);

      testObj.orderRepository.add.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully add new order in database (when input orderSerial empty)`, async () => {
      const inputModel = testObj.inputModel;
      delete inputModel.orderSerial;
      const outputModel = new OrderModel();
      testObj.orderRepository.add.resolves([null, outputModel]);

      const [error, result] = await testObj.orderFastspringApiRepository.add(inputModel);

      testObj.orderRepository.add.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(OrderModel);
    });

    test(`Should error add new order in database (when input orderSerial not empty)`, async () => {
      const inputModel = testObj.inputModel;
      const apiError = new Error('API call error');
      axiosGetStub.throws(apiError);

      const [error] = await testObj.orderFastspringApiRepository.add(inputModel);

      axiosGetStub.should.have.callCount(1);
      expect(error).to.be.an.instanceof(ApiCallException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully add new order in database (when input orderSerial not empty)`, async () => {
      const inputModel = testObj.inputModel;
      const outputObj = {
        order: 'JBj0XhylT4KFgcC8Uuh_cg',
        id: 'JBj0XhylT4KFgcC8Uuh_cg',
        reference: 'DESAINEGMBH220430-1274-45122',
        buyerReference: null,
        ipAddress: '5.9.190.214',
        completed: true,
        changed: 1651311117282,
        changedValue: 1651311117282,
        changedInSeconds: 1651311117,
        changedDisplay: '4/30/22',
        changedDisplayISO8601: '2022-04-30',
        language: 'en',
        live: false,
        currency: 'USD',
        payoutCurrency: 'USD',
        quote: null,
        invoiceUrl:
          'https://venomsupply.test.onfastspring.com/popup-venomsupply/account/order/DESAINEGMBH220430-1274-45122/invoice/IVSHNN74BOAZDKHEI7VT4HI4D2UQ',
        account: 'RPHaJMN4RAGRA0YUVCAxqQ',
        total: 193.05,
        totalDisplay: '$193.05',
        totalInPayoutCurrency: 193.05,
        totalInPayoutCurrencyDisplay: '$193.05',
        tax: 13.05,
        taxDisplay: '$13.05',
        taxInPayoutCurrency: 13.05,
        taxInPayoutCurrencyDisplay: '$13.05',
        subtotal: 180,
        subtotalDisplay: '$180.00',
        subtotalInPayoutCurrency: 180,
        subtotalInPayoutCurrencyDisplay: '$180.00',
        discount: 0,
        discountDisplay: '$0.00',
        discountInPayoutCurrency: 0,
        discountInPayoutCurrencyDisplay: '$0.00',
        discountWithTax: 0,
        discountWithTaxDisplay: '$0.00',
        discountWithTaxInPayoutCurrency: 0,
        discountWithTaxInPayoutCurrencyDisplay: '$0.00',
        billDescriptor: 'FS* venomsupply.io',
        payment: {
          type: 'test',
          cardEnding: '4242',
        },
        customer: {
          first: 'John',
          last: 'Doe',
          email: 'ceyojab810@arpizol.com',
          company: 'Company Name',
          phone: '555-555-5555',
          subscribed: true,
        },
        address: {
          city: 'Lincoln',
          regionCode: 'NE',
          regionDisplay: 'Nebraska',
          region: 'Nebraska',
          postalCode: '68510',
          country: 'US',
          display: 'Lincoln, Nebraska, 68510, US',
        },
        recipients: [
          {
            recipient: {
              first: 'John',
              last: 'Doe',
              email: 'ceyojab810@arpizol.com',
              company: 'Company Name',
              phone: '555-555-5555',
              subscribed: true,
              account: 'RPHaJMN4RAGRA0YUVCAxqQ',
              address: {
                city: 'Lincoln',
                regionCode: 'NE',
                regionDisplay: 'Nebraska',
                region: 'Nebraska',
                postalCode: '68510',
                country: 'US',
                display: 'Lincoln, Nebraska, 68510, US',
              },
            },
          },
        ],
        notes: [],
        items: [
          {
            product: 'at-datacenter-proxies-100',
            quantity: 1,
            display: 'AT Datacenter Proxies [100]',
            sku: null,
            imageUrl: null,
            subtotal: 180,
            subtotalDisplay: '$180.00',
            subtotalInPayoutCurrency: 180,
            subtotalInPayoutCurrencyDisplay: '$180.00',
            discount: 0,
            discountDisplay: '$0.00',
            discountInPayoutCurrency: 0,
            discountInPayoutCurrencyDisplay: '$0.00',
            subscription: 'UonznI0CQ_a1AKUDeY2jvw',
            fulfillments: {},
            withholdings: {
              taxWithholdings: false,
            },
          },
        ],
        action: 'order.get',
        result: 'success',
      };
      axiosGetStub.resolves({ data: outputObj });
      const outputModel = new OrderModel();
      testObj.orderRepository.add.resolves([null, outputModel]);

      const [error, result] = await testObj.orderFastspringApiRepository.add(inputModel);

      axiosGetStub.should.have.callCount(1);
      testObj.orderRepository.add.should.have.callCount(1);
      testObj.orderRepository.add.should.have.calledWith(
        sinon.match
          .has('status', OrderModel.STATUS_SUCCESS)
          .and(sinon.match.has('orderBodyData', JSON.stringify(outputObj))),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(OrderModel);
    });
  });

  suite(`Add new order subscription`, () => {
    setup(() => {
      const inputModel = new SubscriptionModel();
      inputModel.orderId = testObj.identifierGenerator1.generateId();
      inputModel.serial = 'serial';
      inputModel.status = SubscriptionModel.STATUS_ACTIVATED;
      inputModel.subscriptionBodyData = '{}';

      testObj.inputModel = inputModel;
    });

    test(`Should error add new order subscription in database`, async () => {
      const inputModel = testObj.inputModel;
      testObj.orderRepository.addSubscription.resolves([new UnknownException()]);

      const [error] = await testObj.orderFastspringApiRepository.addSubscription(inputModel);

      testObj.orderRepository.addSubscription.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully add new order subscription in database`, async () => {
      const inputModel = testObj.inputModel;
      const outputModel = new SubscriptionModel();
      testObj.orderRepository.addSubscription.resolves([null, outputModel]);

      const [error, result] = await testObj.orderFastspringApiRepository.addSubscription(
        inputModel,
      );

      testObj.orderRepository.addSubscription.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(SubscriptionModel);
    });
  });

  suite(`Update order`, () => {
    test(`Should error update order when execute query (when input orderSerial or status empty)`, async () => {
      const inputModel = new OrderModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      testObj.orderRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.orderFastspringApiRepository.update(inputModel);

      testObj.orderRepository.update.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully update order (when input orderSerial or status empty)`, async () => {
      const inputModel = new OrderModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      testObj.orderRepository.update.resolves([null]);

      const [error] = await testObj.orderFastspringApiRepository.update(inputModel);

      testObj.orderRepository.update.should.have.callCount(1);
      expect(error).to.be.a('null');
    });

    test(`Should error update order in database (when input orderSerial or status not empty)`, async () => {
      const inputModel = new OrderModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.orderSerial = 'orderSerial';
      inputModel.status = OrderModel.STATUS_SUCCESS;
      const apiError = new Error('API call error');
      axiosGetStub.throws(apiError);

      const [error] = await testObj.orderFastspringApiRepository.update(inputModel);

      axiosGetStub.should.have.callCount(1);
      expect(error).to.be.an.instanceof(ApiCallException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully update order in database (when input orderSerial not empty)`, async () => {
      const inputModel = new OrderModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.orderSerial = 'orderSerial';
      inputModel.status = OrderModel.STATUS_SUCCESS;
      const outputObj = {
        order: 'JBj0XhylT4KFgcC8Uuh_cg',
        id: 'JBj0XhylT4KFgcC8Uuh_cg',
        reference: 'DESAINEGMBH220430-1274-45122',
        buyerReference: null,
        ipAddress: '5.9.190.214',
        completed: true,
        changed: 1651311117282,
        changedValue: 1651311117282,
        changedInSeconds: 1651311117,
        changedDisplay: '4/30/22',
        changedDisplayISO8601: '2022-04-30',
        language: 'en',
        live: false,
        currency: 'USD',
        payoutCurrency: 'USD',
        quote: null,
        invoiceUrl:
          'https://venomsupply.test.onfastspring.com/popup-venomsupply/account/order/DESAINEGMBH220430-1274-45122/invoice/IVSHNN74BOAZDKHEI7VT4HI4D2UQ',
        account: 'RPHaJMN4RAGRA0YUVCAxqQ',
        total: 193.05,
        totalDisplay: '$193.05',
        totalInPayoutCurrency: 193.05,
        totalInPayoutCurrencyDisplay: '$193.05',
        tax: 13.05,
        taxDisplay: '$13.05',
        taxInPayoutCurrency: 13.05,
        taxInPayoutCurrencyDisplay: '$13.05',
        subtotal: 180,
        subtotalDisplay: '$180.00',
        subtotalInPayoutCurrency: 180,
        subtotalInPayoutCurrencyDisplay: '$180.00',
        discount: 0,
        discountDisplay: '$0.00',
        discountInPayoutCurrency: 0,
        discountInPayoutCurrencyDisplay: '$0.00',
        discountWithTax: 0,
        discountWithTaxDisplay: '$0.00',
        discountWithTaxInPayoutCurrency: 0,
        discountWithTaxInPayoutCurrencyDisplay: '$0.00',
        billDescriptor: 'FS* venomsupply.io',
        payment: {
          type: 'test',
          cardEnding: '4242',
        },
        customer: {
          first: 'John',
          last: 'Doe',
          email: 'ceyojab810@arpizol.com',
          company: 'Company Name',
          phone: '555-555-5555',
          subscribed: true,
        },
        address: {
          city: 'Lincoln',
          regionCode: 'NE',
          regionDisplay: 'Nebraska',
          region: 'Nebraska',
          postalCode: '68510',
          country: 'US',
          display: 'Lincoln, Nebraska, 68510, US',
        },
        recipients: [
          {
            recipient: {
              first: 'John',
              last: 'Doe',
              email: 'ceyojab810@arpizol.com',
              company: 'Company Name',
              phone: '555-555-5555',
              subscribed: true,
              account: 'RPHaJMN4RAGRA0YUVCAxqQ',
              address: {
                city: 'Lincoln',
                regionCode: 'NE',
                regionDisplay: 'Nebraska',
                region: 'Nebraska',
                postalCode: '68510',
                country: 'US',
                display: 'Lincoln, Nebraska, 68510, US',
              },
            },
          },
        ],
        tags: {
          orderId: inputModel.id,
        },
        notes: [],
        items: [
          {
            product: 'at-datacenter-proxies-100',
            quantity: 1,
            display: 'AT Datacenter Proxies [100]',
            sku: null,
            imageUrl: null,
            subtotal: 180,
            subtotalDisplay: '$180.00',
            subtotalInPayoutCurrency: 180,
            subtotalInPayoutCurrencyDisplay: '$180.00',
            discount: 0,
            discountDisplay: '$0.00',
            discountInPayoutCurrency: 0,
            discountInPayoutCurrencyDisplay: '$0.00',
            subscription: 'UonznI0CQ_a1AKUDeY2jvw',
            fulfillments: {},
            withholdings: {
              taxWithholdings: false,
            },
          },
        ],
        action: 'order.get',
        result: 'success',
      };
      axiosGetStub.resolves({ data: outputObj });
      const outputModel = new OrderModel();
      testObj.orderRepository.update.resolves([null, outputModel]);

      const [error, result] = await testObj.orderFastspringApiRepository.update(inputModel);

      axiosGetStub.should.have.callCount(1);
      testObj.orderRepository.update.should.have.callCount(1);
      testObj.orderRepository.update.should.have.calledWith(
        sinon.match
          .has('status', OrderModel.STATUS_SUCCESS)
          .and(sinon.match.has('orderBodyData', JSON.stringify(outputObj))),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(OrderModel);
    });
  });
});
