/**
 * Created by pooya on 5/1/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const axios = require('axios');
const axiosGetStub = sinon.stub(axios, 'get');

const helper = require('~src/helper');

const OrderModel = require('~src/core/model/orderModel');
const PackageModel = require('~src/core/model/packageModel');
const ProductModel = require('~src/core/model/productModel');
const SubscriptionModel = require('~src/core/model/subscriptionModel');
const ExternalStoreModel = require('~src/core/model/externalStoreModel');
const UnknownException = require('~src/core/exception/unknownException');
const NotFoundException = require('~src/core/exception/notFoundException');
const ApiCallException = require('~src/core/exception/apiCallException');
const PaymentDataMatchException = require('~src/core/exception/paymentDataMatchException');
const PaymentServiceMatchException = require('~src/core/exception/paymentServiceMatchException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`FastspringOrderParse`, () => {
  setup(() => {
    const {
      packageService,
      orderService,
      orderRepository,
      fastspringApiRepository,
      fastspringOrderParse,
    } = helper.fakeFastspringOrderParse();

    testObj.packageService = packageService;
    testObj.orderService = orderService;
    testObj.orderRepository = orderRepository;
    testObj.fastspringApiRepository = fastspringApiRepository;
    testObj.fastspringOrderParse = fastspringOrderParse;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
    testObj.consoleError = sinon.stub(console, 'error');
  });

  teardown(() => {
    axiosGetStub.resetHistory();
    testObj.consoleError.restore();
  });

  suite(`Parse events`, () => {
    setup(() => {
      testObj.inputDataOrder = {
        events: [
          {
            id: 'afpsaFkWRw6Qim0vbCnUcg',
            processed: false,
            created: 1651401051135,
            type: 'order.completed',
            live: false,
            data: {
              order: 'BLXqoDqCQqKJUjs2QerHfA',
              id: 'BLXqoDqCQqKJUjs2QerHfA',
              reference: 'DESAINEGMBH220501-1274-82181',
              buyerReference: null,
              ipAddress: '5.255.81.177',
              completed: true,
              changed: 1651401050912,
              changedValue: 1651401050912,
              changedInSeconds: 1651401050,
              changedDisplay: '5/1/22',
              changedDisplayISO8601: '2022-05-01',
              language: 'en',
              live: false,
              currency: 'USD',
              payoutCurrency: 'USD',
              quote: null,
              invoiceUrl:
                'https://venomsupply.test.onfastspring.com/popup-venomsupply/account/order/DESAINEGMBH220501-1274-82181/invoice/IV4EM42HFCTJG2TDPLU6CHVZ4OPA',
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
              payment: { type: 'test', cardEnding: '4242' },
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
              recipients: {},
              tags: { orderId: testObj.identifierGenerator.generateId() },
              notes: [],
              items: {},
            },
          },
        ],
      };
    });

    test(`Should error parse events if service name not match`, async () => {
      const inputServiceName = '';
      const inputData = {};

      const [error] = await testObj.fastspringOrderParse.parse(inputServiceName, inputData);

      expect(error).to.be.an.instanceof(PaymentServiceMatchException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error parse events if service name not match`, async () => {
      const inputServiceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      const inputData = {};

      const [error] = await testObj.fastspringOrderParse.parse(inputServiceName, inputData);

      expect(error).to.be.an.instanceof(PaymentDataMatchException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully parse events if data object not match`, async () => {
      const inputServiceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      const inputData = testObj.inputDataOrder;

      const [error] = await testObj.fastspringOrderParse.parse(inputServiceName, inputData);

      expect(error).to.be.a('null');
    });
  });

  suite(`Add subscription`, () => {
    setup(() => {
      const outputModel = new OrderModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.serviceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputModel.orderSerial = 'order serial';
      outputModel.status = OrderModel.STATUS_SUCCESS;

      testObj.outputModel = outputModel;
      testObj.inputDataSubscription = {
        events: [
          {
            id: '6_hNJCU9Q4SSCGiGaxmbnw',
            processed: false,
            created: 1651401050743,
            type: 'subscription.activated',
            live: false,
            data: {
              id: 'fL_qYu2uSyO_F5j81kbh1g',
              quote: null,
              subscription: 'fL_qYu2uSyO_F5j81kbh1g',
              active: true,
              state: 'active',
              changed: 1651401050743,
              changedValue: 1651401050743,
              changedInSeconds: 1651401050,
              changedDisplay: '5/1/22',
              changedDisplayISO8601: '2022-05-01',
              live: false,
              currency: 'USD',
              account: 'RPHaJMN4RAGRA0YUVCAxqQ',
              product: 'at-datacenter-proxies-100',
              sku: null,
              display: 'AT Datacenter Proxies [100]',
              quantity: 1,
              adhoc: false,
              autoRenew: true,
              price: 180,
              priceDisplay: '$180.00',
              priceInPayoutCurrency: 180,
              priceInPayoutCurrencyDisplay: '$180.00',
              discount: 0,
              discountDisplay: '$0.00',
              discountInPayoutCurrency: 0,
              discountInPayoutCurrencyDisplay: '$0.00',
              subtotal: 193.05,
              subtotalDisplay: '$193.05',
              subtotalInPayoutCurrency: 193.05,
              subtotalInPayoutCurrencyDisplay: '$193.05',
              tags: { orderId: testObj.identifierGenerator.generateId() },
              next: 1654041600000,
              nextValue: 1654041600000,
              nextInSeconds: 1654041600,
              nextDisplay: '6/1/22',
              nextDisplayISO8601: '2022-06-01',
              end: null,
              endValue: null,
              endInSeconds: null,
              endDisplay: null,
              endDisplayISO8601: null,
              canceledDate: null,
              canceledDateValue: null,
              canceledDateInSeconds: null,
              canceledDateDisplay: null,
              canceledDateDisplayISO8601: null,
              deactivationDate: null,
              deactivationDateValue: null,
              deactivationDateInSeconds: null,
              deactivationDateDisplay: null,
              deactivationDateDisplayISO8601: null,
              sequence: 1,
              periods: null,
              remainingPeriods: null,
              begin: 1651363200000,
              beginValue: 1651363200000,
              beginInSeconds: 1651363200,
              beginDisplay: '5/1/22',
              beginDisplayISO8601: '2022-05-01',
              intervalUnit: 'month',
              intervalLength: 1,
              nextChargeCurrency: 'USD',
              nextChargeDate: 1654041600000,
              nextChargeDateValue: 1654041600000,
              nextChargeDateInSeconds: 1654041600,
              nextChargeDateDisplay: '6/1/22',
              nextChargeDateDisplayISO8601: '2022-06-01',
              nextChargePreTax: 180,
              nextChargePreTaxDisplay: '$180.00',
              nextChargePreTaxInPayoutCurrency: 180,
              nextChargePreTaxInPayoutCurrencyDisplay: '$180.00',
              nextChargeTotal: 193.05,
              nextChargeTotalDisplay: '$193.05',
              nextChargeTotalInPayoutCurrency: 193.05,
              nextChargeTotalInPayoutCurrencyDisplay: '$193.05',
              nextNotificationType: 'PAYMENT_REMINDER',
              nextNotificationDate: 1653436800000,
              nextNotificationDateValue: 1653436800000,
              nextNotificationDateInSeconds: 1653436800,
              nextNotificationDateDisplay: '5/25/22',
              nextNotificationDateDisplayISO8601: '2022-05-25',
              paymentReminder: { intervalUnit: 'week', intervalLength: 1 },
              paymentOverdue: { intervalUnit: 'week', intervalLength: 1, total: 4, sent: 0 },
              cancellationSetting: {
                cancellation: 'AFTER_LAST_NOTIFICATION',
                intervalUnit: 'week',
                intervalLength: 1,
              },
              fulfillments: null,
              instructions: {},
              initialOrderId: 'BLXqoDqCQqKJUjs2QerHfA',
              initialOrderReference: 'DESAINEGMBH220501-1274-82181',
            },
          },
        ],
      };
    });

    test(`Should error parse events when add subscription (error on get order info)`, async () => {
      const inputServiceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      const inputData = testObj.inputDataSubscription;
      testObj.fastspringApiRepository.getOrder.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringOrderParse.parse(inputServiceName, inputData);

      expect(error).to.be.a('null');
      testObj.fastspringApiRepository.getOrder.should.have.callCount(1);
      testObj.consoleError.should.have.callCount(1);
    });

    test(`Should error parse events when add subscription`, async () => {
      const inputServiceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      const inputData = testObj.inputDataSubscription;
      const outputModel = testObj.outputModel;
      testObj.fastspringApiRepository.getOrder.resolves([null, outputModel]);
      testObj.orderRepository.addSubscription.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringOrderParse.parse(inputServiceName, inputData);

      expect(error).to.be.a('null');
      testObj.orderRepository.addSubscription.should.have.callCount(1);
      testObj.orderRepository.addSubscription.should.have.calledWith(
        sinon.match
          .instanceOf(SubscriptionModel)
          .and(sinon.match.has('orderId', testObj.identifierGenerator.generateId()))
          .and(sinon.match.has('serial', inputData.events[0].data.id))
          .and(sinon.match.has('status', SubscriptionModel.STATUS_ACTIVATED))
          .and(sinon.match.has('subscriptionBodyData', JSON.stringify(inputData.events[0].data))),
      );
      testObj.consoleError.should.callCount(1);
    });

    test(`Should error parse events when add subscription`, async () => {
      const inputServiceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      const inputData = testObj.inputDataSubscription;
      const outputModel = testObj.outputModel;
      testObj.fastspringApiRepository.getOrder.resolves([null, outputModel]);
      testObj.orderRepository.addSubscription.resolves([null]);

      const [error] = await testObj.fastspringOrderParse.parse(inputServiceName, inputData);

      expect(error).to.be.a('null');
      testObj.orderRepository.addSubscription.should.have.callCount(1);
      testObj.orderRepository.addSubscription.should.have.calledWith(
        sinon.match
          .instanceOf(SubscriptionModel)
          .and(sinon.match.has('orderId', testObj.identifierGenerator.generateId()))
          .and(sinon.match.has('serial', inputData.events[0].data.id))
          .and(sinon.match.has('status', SubscriptionModel.STATUS_ACTIVATED))
          .and(sinon.match.has('subscriptionBodyData', JSON.stringify(inputData.events[0].data))),
      );
      testObj.consoleError.should.callCount(0);
    });
  });

  suite(`Add cancel subscription`, () => {
    setup(() => {
      testObj.inputDataSubscription = {
        events: [
          {
            id: 'IZPctFfySiGRKKHwnqsIEg',
            processed: false,
            created: 1652170730281,
            type: 'subscription.canceled',
            live: false,
            data: {
              id: 'subscription serial',
              quote: null,
              subscription: 'subscription serial',
              active: true,
              state: 'canceled',
              changed: 1652170730281,
              changedValue: 1652170730281,
              changedInSeconds: 1652170730,
              changedDisplay: '5/10/22',
              changedDisplayISO8601: '2022-05-10',
              live: false,
              currency: 'USD',
              account: '4w0LKG1mSE6-HEnGCt5xkA',
              product: 'at-datacenter-proxies-100',
              sku: null,
              display: 'AT Datacenter Proxies [100]',
              quantity: 1,
              adhoc: false,
              autoRenew: true,
              price: 180,
              priceDisplay: '$180.00',
              priceInPayoutCurrency: 180,
              priceInPayoutCurrencyDisplay: '$180.00',
              discount: 0,
              discountDisplay: '$0.00',
              discountInPayoutCurrency: 0,
              discountInPayoutCurrencyDisplay: '$0.00',
              subtotal: 193.05,
              subtotalDisplay: '$193.05',
              subtotalInPayoutCurrency: 193.05,
              subtotalInPayoutCurrencyDisplay: '$193.05',
              tags: { orderId: '17e5e218-80df-4a35-8023-42ee943f2356' },
              next: 1654819200000,
              nextValue: 1654819200000,
              nextInSeconds: 1654819200,
              nextDisplay: '6/10/22',
              nextDisplayISO8601: '2022-06-10',
              end: null,
              endValue: null,
              endInSeconds: null,
              endDisplay: null,
              endDisplayISO8601: null,
              canceledDate: 1652140800000,
              canceledDateValue: 1652140800000,
              canceledDateInSeconds: 1652140800,
              canceledDateDisplay: '5/10/22',
              canceledDateDisplayISO8601: '2022-05-10',
              deactivationDate: 1654819200000,
              deactivationDateValue: 1654819200000,
              deactivationDateInSeconds: 1654819200,
              deactivationDateDisplay: '6/10/22',
              deactivationDateDisplayISO8601: '2022-06-10',
              sequence: 1,
              periods: null,
              remainingPeriods: null,
              begin: 1652140800000,
              beginValue: 1652140800000,
              beginInSeconds: 1652140800,
              beginDisplay: '5/10/22',
              beginDisplayISO8601: '2022-05-10',
              intervalUnit: 'month',
              intervalLength: 1,
              nextChargeCurrency: 'USD',
              nextChargeDate: 1654819200000,
              nextChargeDateValue: 1654819200000,
              nextChargeDateInSeconds: 1654819200,
              nextChargeDateDisplay: '6/10/22',
              nextChargeDateDisplayISO8601: '2022-06-10',
              nextChargePreTax: 180,
              nextChargePreTaxDisplay: '$180.00',
              nextChargePreTaxInPayoutCurrency: 180,
              nextChargePreTaxInPayoutCurrencyDisplay: '$180.00',
              nextChargeTotal: 193.05,
              nextChargeTotalDisplay: '$193.05',
              nextChargeTotalInPayoutCurrency: 193.05,
              nextChargeTotalInPayoutCurrencyDisplay: '$193.05',
              nextNotificationType: 'PAYMENT_REMINDER',
              nextNotificationDate: 1654214400000,
              nextNotificationDateValue: 1654214400000,
              nextNotificationDateInSeconds: 1654214400,
              nextNotificationDateDisplay: '6/3/22',
              nextNotificationDateDisplayISO8601: '2022-06-03',
              paymentReminder: { intervalUnit: 'week', intervalLength: 1 },
              paymentOverdue: {
                intervalUnit: 'week',
                intervalLength: 1,
                total: 4,
                sent: 0,
              },
              cancellationSetting: {
                cancellation: 'AFTER_LAST_NOTIFICATION',
                intervalUnit: 'week',
                intervalLength: 1,
              },
              fulfillments: {},
              instructions: [
                {
                  product: 'at-datacenter-proxies-100',
                  type: 'regular',
                  periodStartDate: null,
                  periodStartDateValue: null,
                  periodStartDateInSeconds: null,
                  periodStartDateDisplay: null,
                  periodStartDateDisplayISO8601: null,
                  periodEndDate: null,
                  periodEndDateValue: null,
                  periodEndDateInSeconds: null,
                  periodEndDateDisplay: null,
                  periodEndDateDisplayISO8601: null,
                  intervalUnit: 'month',
                  intervalLength: 1,
                  discountPercent: 0,
                  discountPercentValue: 0,
                  discountPercentDisplay: '0%',
                  discountTotal: 0,
                  discountTotalDisplay: '$0.00',
                  discountTotalInPayoutCurrency: 0,
                  discountTotalInPayoutCurrencyDisplay: '$0.00',
                  unitDiscount: 0,
                  unitDiscountDisplay: '$0.00',
                  unitDiscountInPayoutCurrency: 0,
                  unitDiscountInPayoutCurrencyDisplay: '$0.00',
                  price: 180,
                  priceDisplay: '$180.00',
                  priceInPayoutCurrency: 180,
                  priceInPayoutCurrencyDisplay: '$180.00',
                  priceTotal: 180,
                  priceTotalDisplay: '$180.00',
                  priceTotalInPayoutCurrency: 180,
                  priceTotalInPayoutCurrencyDisplay: '$180.00',
                  unitPrice: 180,
                  unitPriceDisplay: '$180.00',
                  unitPriceInPayoutCurrency: 180,
                  unitPriceInPayoutCurrencyDisplay: '$180.00',
                  total: 180,
                  totalDisplay: '$180.00',
                  totalInPayoutCurrency: 180,
                  totalInPayoutCurrencyDisplay: '$180.00',
                },
              ],
              initialOrderId: 'order serial',
              initialOrderReference: 'DESAINEGMBH220510-3308-55135',
            },
          },
        ],
      };
    });

    test(`Should error parse event when cancel subscription (error on get order info)`, async () => {
      const inputServiceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      const inputData = testObj.inputDataSubscription;
      testObj.orderRepository.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringOrderParse.parse(inputServiceName, inputData);

      expect(error).to.be.a('null');
      testObj.orderRepository.getAll.should.have.callCount(1);
      testObj.orderRepository.getAll.should.have.calledWith(
        sinon.match.has('orderSerial', 'order serial'),
      );
      testObj.consoleError.should.have.callCount(1);
    });

    test(`Should successfully parse event when cancel subscription (not found data)`, async () => {
      const inputServiceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      const inputData = testObj.inputDataSubscription;
      testObj.orderRepository.getAll.resolves([null, []]);

      const [error] = await testObj.fastspringOrderParse.parse(inputServiceName, inputData);

      expect(error).to.be.a('null');
      testObj.orderRepository.getAll.should.have.callCount(1);
      testObj.orderRepository.getAll.should.have.calledWith(
        sinon.match.has('orderSerial', 'order serial'),
      );
      testObj.consoleError.should.have.callCount(0);
    });

    test(`Should successfully parse event when cancel subscription (package info is null)`, async () => {
      const inputServiceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      const inputData = testObj.inputDataSubscription;
      const outputOrderModel = new OrderModel();
      outputOrderModel.packageId = null;
      testObj.orderRepository.getAll.resolves([null, [outputOrderModel]]);

      const [error] = await testObj.fastspringOrderParse.parse(inputServiceName, inputData);

      expect(error).to.be.a('null');
      testObj.orderRepository.getAll.should.have.callCount(1);
      testObj.orderRepository.getAll.should.have.calledWith(
        sinon.match.has('orderSerial', 'order serial'),
      );
      testObj.consoleError.should.have.callCount(0);
    });

    test(`Should error parse event when cancel subscription (error on get package info)`, async () => {
      const inputServiceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      const inputData = testObj.inputDataSubscription;
      const outputOrderModel = new OrderModel();
      outputOrderModel.packageId = testObj.identifierGenerator.generateId();
      testObj.orderRepository.getAll.resolves([null, [outputOrderModel]]);
      testObj.packageService.getById.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringOrderParse.parse(inputServiceName, inputData);

      expect(error).to.be.a('null');
      testObj.orderRepository.getAll.should.have.callCount(1);
      testObj.orderRepository.getAll.should.have.calledWith(
        sinon.match.has('orderSerial', 'order serial'),
      );
      testObj.packageService.getById.should.have.callCount(1);
      testObj.packageService.getById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.consoleError.should.have.callCount(1);
    });

    test(`Should successfully parse event when cancel subscription (if package status is not enable)`, async () => {
      const inputServiceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      const inputData = testObj.inputDataSubscription;
      const outputOrderModel = new OrderModel();
      outputOrderModel.packageId = testObj.identifierGenerator.generateId();
      testObj.orderRepository.getAll.resolves([null, [outputOrderModel]]);
      const outputPackageModel = new PackageModel();
      outputPackageModel.id = testObj.identifierGenerator.generateId();
      outputPackageModel.status = PackageModel.STATUS_CANCEL;
      testObj.packageService.getById.resolves([null, outputPackageModel]);

      const [error] = await testObj.fastspringOrderParse.parse(inputServiceName, inputData);

      expect(error).to.be.a('null');
      testObj.orderRepository.getAll.should.have.callCount(1);
      testObj.orderRepository.getAll.should.have.calledWith(
        sinon.match.has('orderSerial', 'order serial'),
      );
      testObj.packageService.getById.should.have.callCount(1);
      testObj.packageService.getById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.consoleError.should.have.callCount(0);
    });

    test(`Should error parse event when cancel subscription (error on cancel package)`, async () => {
      const inputServiceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      const inputData = testObj.inputDataSubscription;
      const outputOrderModel = new OrderModel();
      outputOrderModel.packageId = testObj.identifierGenerator.generateId();
      testObj.orderRepository.getAll.resolves([null, [outputOrderModel]]);
      const outputPackageModel = new PackageModel();
      outputPackageModel.id = testObj.identifierGenerator.generateId();
      outputPackageModel.status = PackageModel.STATUS_ENABLE;
      testObj.packageService.getById.resolves([null, outputPackageModel]);
      testObj.packageService.cancel.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringOrderParse.parse(inputServiceName, inputData);

      expect(error).to.be.a('null');
      testObj.orderRepository.getAll.should.have.callCount(1);
      testObj.orderRepository.getAll.should.have.calledWith(
        sinon.match.has('orderSerial', 'order serial'),
      );
      testObj.packageService.getById.should.have.callCount(1);
      testObj.packageService.getById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.packageService.cancel.should.have.callCount(1);
      testObj.packageService.cancel.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.consoleError.should.have.callCount(1);
    });

    test(`Should error parse event when cancel subscription (cancel package)`, async () => {
      const inputServiceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      const inputData = testObj.inputDataSubscription;
      const outputOrderModel = new OrderModel();
      outputOrderModel.packageId = testObj.identifierGenerator.generateId();
      testObj.orderRepository.getAll.resolves([null, [outputOrderModel]]);
      const outputPackageModel = new PackageModel();
      outputPackageModel.id = testObj.identifierGenerator.generateId();
      outputPackageModel.status = PackageModel.STATUS_ENABLE;
      testObj.packageService.getById.resolves([null, outputPackageModel]);
      testObj.packageService.cancel.resolves([null]);

      const [error] = await testObj.fastspringOrderParse.parse(inputServiceName, inputData);

      expect(error).to.be.a('null');
      testObj.orderRepository.getAll.should.have.callCount(1);
      testObj.orderRepository.getAll.should.have.calledWith(
        sinon.match.has('orderSerial', 'order serial'),
      );
      testObj.packageService.getById.should.have.callCount(1);
      testObj.packageService.getById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.packageService.cancel.should.have.callCount(1);
      testObj.packageService.cancel.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.consoleError.should.have.callCount(0);
    });
  });
});
