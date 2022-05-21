/**
 * Created by pooya on 5/8/22.
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
const PaymentServiceModel = require('~src/core/model/paymentServiceModel');
const UnknownException = require('~src/core/exception/unknownException');
const ApiCallException = require('~src/core/exception/apiCallException');
const InvalidOrderPaymentException = require('~src/core/exception/invalidOrderPaymentException');
const FastspringAlreadyCanceledException = require('~src/core/exception/fastspringAlreadyCanceledException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

/**
 * @property eventually
 * @property rejectedWith
 */
const expect = chai.expect;
const testObj = {};

suite(`FastspringApiRepository`, () => {
  setup(() => {
    const { paymentService, fastspringApiRepository } = helper.fakeFastspringApiRepository();

    testObj.paymentService = paymentService;
    testObj.fastspringApiRepository = fastspringApiRepository;

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

  suite(`Get order`, () => {
    test(`Should error get order`, async () => {
      const inputSerial = 'order serial';
      const apiError = new Error('API call error');
      axiosGetStub.throws(apiError);

      const [error] = await testObj.fastspringApiRepository.getOrder(inputSerial);

      axiosGetStub.should.have.callCount(1);
      expect(error).to.be.an.instanceof(ApiCallException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error get order when get payment list`, async () => {
      const inputSerial = 'order serial';
      axiosGetStub.resolves({
        data: {
          order: 'order serial',
          id: 'order serial',
          reference: 'DESAINEGMBH220510-3308-55135',
          buyerReference: null,
          ipAddress: '5.9.190.214',
          completed: true,
          changed: 1652170576496,
          changedValue: 1652170576496,
          changedInSeconds: 1652170576,
          changedDisplay: '5/10/22',
          changedDisplayISO8601: '2022-05-10',
          language: 'en',
          live: false,
          currency: 'USD',
          payoutCurrency: 'USD',
          quote: null,
          invoiceUrl:
            'https://venomsupply.test.onfastspring.com/popup-venomsupply/account/order/DESAINEGMBH220510-3308-55135/invoice/IV357D5QFPNND65C4RMTWBF24SLE',
          account: '4w0LKG1mSE6-HEnGCt5xkA',
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
            email: 'tovaki7446@azteen.com',
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
                email: 'tovaki7446@azteen.com',
                company: 'Company Name',
                phone: '555-555-5555',
                subscribed: true,
                account: '4w0LKG1mSE6-HEnGCt5xkA',
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
            orderId: testObj.identifierGenerator.generateId(),
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
              subscription: 'LeabxoVwSoWEgmr4NKFqtw',
              fulfillments: {},
              withholdings: {
                taxWithholdings: false,
              },
            },
          ],
          action: 'order.get',
          result: 'success',
          orders: [
            {
              order: 'order serial',
              id: 'order serial',
              reference: 'DESAINEGMBH220510-3308-55135',
              buyerReference: null,
              ipAddress: '5.9.190.214',
              completed: true,
              changed: 1652170576496,
              changedValue: 1652170576496,
              changedInSeconds: 1652170576,
              changedDisplay: '5/10/22',
              changedDisplayISO8601: '2022-05-10',
              language: 'en',
              live: false,
              currency: 'USD',
              payoutCurrency: 'USD',
              quote: null,
              invoiceUrl:
                'https://venomsupply.test.onfastspring.com/popup-venomsupply/account/order/DESAINEGMBH220510-3308-55135/invoice/IV357D5QFPNND65C4RMTWBF24SLE',
              account: '4w0LKG1mSE6-HEnGCt5xkA',
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
                email: 'tovaki7446@azteen.com',
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
                    email: 'tovaki7446@azteen.com',
                    company: 'Company Name',
                    phone: '555-555-5555',
                    subscribed: true,
                    account: '4w0LKG1mSE6-HEnGCt5xkA',
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
                orderId: testObj.identifierGenerator.generateId(),
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
                  subscription: 'LeabxoVwSoWEgmr4NKFqtw',
                  fulfillments: {},
                  withholdings: {
                    taxWithholdings: false,
                  },
                },
              ],
              action: 'order.get',
              result: 'success',
            },
          ],
        },
      });
      testObj.paymentService.getAllPaymentMethod.resolves([new UnknownException()]);

      const [error] = await testObj.fastspringApiRepository.getOrder(inputSerial);

      axiosGetStub.should.have.callCount(1);
      testObj.paymentService.getAllPaymentMethod.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error get order when payment type is test but server run in product`, async () => {
      const inputSerial = 'order serial';
      axiosGetStub.resolves({
        data: {
          order: 'order serial',
          id: 'order serial',
          reference: 'DESAINEGMBH220510-3308-55135',
          buyerReference: null,
          ipAddress: '5.9.190.214',
          completed: true,
          changed: 1652170576496,
          changedValue: 1652170576496,
          changedInSeconds: 1652170576,
          changedDisplay: '5/10/22',
          changedDisplayISO8601: '2022-05-10',
          language: 'en',
          live: false,
          currency: 'USD',
          payoutCurrency: 'USD',
          quote: null,
          invoiceUrl:
            'https://venomsupply.test.onfastspring.com/popup-venomsupply/account/order/DESAINEGMBH220510-3308-55135/invoice/IV357D5QFPNND65C4RMTWBF24SLE',
          account: '4w0LKG1mSE6-HEnGCt5xkA',
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
            email: 'tovaki7446@azteen.com',
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
                email: 'tovaki7446@azteen.com',
                company: 'Company Name',
                phone: '555-555-5555',
                subscribed: true,
                account: '4w0LKG1mSE6-HEnGCt5xkA',
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
            orderId: testObj.identifierGenerator.generateId(),
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
              subscription: 'LeabxoVwSoWEgmr4NKFqtw',
              fulfillments: {},
              withholdings: {
                taxWithholdings: false,
              },
            },
          ],
          action: 'order.get',
          result: 'success',
          orders: [
            {
              order: 'order serial',
              id: 'order serial',
              reference: 'DESAINEGMBH220510-3308-55135',
              buyerReference: null,
              ipAddress: '5.9.190.214',
              completed: true,
              changed: 1652170576496,
              changedValue: 1652170576496,
              changedInSeconds: 1652170576,
              changedDisplay: '5/10/22',
              changedDisplayISO8601: '2022-05-10',
              language: 'en',
              live: false,
              currency: 'USD',
              payoutCurrency: 'USD',
              quote: null,
              invoiceUrl:
                'https://venomsupply.test.onfastspring.com/popup-venomsupply/account/order/DESAINEGMBH220510-3308-55135/invoice/IV357D5QFPNND65C4RMTWBF24SLE',
              account: '4w0LKG1mSE6-HEnGCt5xkA',
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
                email: 'tovaki7446@azteen.com',
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
                    email: 'tovaki7446@azteen.com',
                    company: 'Company Name',
                    phone: '555-555-5555',
                    subscribed: true,
                    account: '4w0LKG1mSE6-HEnGCt5xkA',
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
                orderId: testObj.identifierGenerator.generateId(),
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
                  subscription: 'LeabxoVwSoWEgmr4NKFqtw',
                  fulfillments: {},
                  withholdings: {
                    taxWithholdings: false,
                  },
                },
              ],
              action: 'order.get',
              result: 'success',
            },
          ],
        },
      });
      const outputPaymentModel = new PaymentServiceModel();
      outputPaymentModel.serviceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputPaymentModel.mode = PaymentServiceModel.MODE_PRODUCT;
      testObj.paymentService.getAllPaymentMethod.resolves([null, [outputPaymentModel]]);

      const [error] = await testObj.fastspringApiRepository.getOrder(inputSerial);

      axiosGetStub.should.have.callCount(1);
      testObj.paymentService.getAllPaymentMethod.should.have.callCount(1);
      expect(error).to.be.an.instanceof(InvalidOrderPaymentException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully get order (test mode)`, async () => {
      const inputSerial = 'order serial';
      axiosGetStub.resolves({
        data: {
          order: 'order serial',
          id: 'order serial',
          reference: 'DESAINEGMBH220510-3308-55135',
          buyerReference: null,
          ipAddress: '5.9.190.214',
          completed: true,
          changed: 1652170576496,
          changedValue: 1652170576496,
          changedInSeconds: 1652170576,
          changedDisplay: '5/10/22',
          changedDisplayISO8601: '2022-05-10',
          language: 'en',
          live: false,
          currency: 'USD',
          payoutCurrency: 'USD',
          quote: null,
          invoiceUrl:
            'https://venomsupply.test.onfastspring.com/popup-venomsupply/account/order/DESAINEGMBH220510-3308-55135/invoice/IV357D5QFPNND65C4RMTWBF24SLE',
          account: '4w0LKG1mSE6-HEnGCt5xkA',
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
            email: 'tovaki7446@azteen.com',
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
                email: 'tovaki7446@azteen.com',
                company: 'Company Name',
                phone: '555-555-5555',
                subscribed: true,
                account: '4w0LKG1mSE6-HEnGCt5xkA',
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
            orderId: testObj.identifierGenerator.generateId(),
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
              subscription: 'LeabxoVwSoWEgmr4NKFqtw',
              fulfillments: {},
              withholdings: {
                taxWithholdings: false,
              },
            },
          ],
          action: 'order.get',
          result: 'success',
          orders: [
            {
              order: 'order serial',
              id: 'order serial',
              reference: 'DESAINEGMBH220510-3308-55135',
              buyerReference: null,
              ipAddress: '5.9.190.214',
              completed: true,
              changed: 1652170576496,
              changedValue: 1652170576496,
              changedInSeconds: 1652170576,
              changedDisplay: '5/10/22',
              changedDisplayISO8601: '2022-05-10',
              language: 'en',
              live: false,
              currency: 'USD',
              payoutCurrency: 'USD',
              quote: null,
              invoiceUrl:
                'https://venomsupply.test.onfastspring.com/popup-venomsupply/account/order/DESAINEGMBH220510-3308-55135/invoice/IV357D5QFPNND65C4RMTWBF24SLE',
              account: '4w0LKG1mSE6-HEnGCt5xkA',
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
                email: 'tovaki7446@azteen.com',
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
                    email: 'tovaki7446@azteen.com',
                    company: 'Company Name',
                    phone: '555-555-5555',
                    subscribed: true,
                    account: '4w0LKG1mSE6-HEnGCt5xkA',
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
                orderId: testObj.identifierGenerator.generateId(),
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
                  subscription: 'LeabxoVwSoWEgmr4NKFqtw',
                  fulfillments: {},
                  withholdings: {
                    taxWithholdings: false,
                  },
                },
              ],
              action: 'order.get',
              result: 'success',
            },
          ],
        },
      });
      const outputPaymentModel = new PaymentServiceModel();
      outputPaymentModel.serviceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputPaymentModel.mode = PaymentServiceModel.MODE_TEST;
      testObj.paymentService.getAllPaymentMethod.resolves([null, [outputPaymentModel]]);

      const [error, result] = await testObj.fastspringApiRepository.getOrder(inputSerial);

      axiosGetStub.should.have.callCount(1);
      testObj.paymentService.getAllPaymentMethod.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(OrderModel).and.have.include({
        id: testObj.identifierGenerator.generateId(),
        orderSerial: 'order serial',
        serviceName: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        status: OrderModel.STATUS_SUCCESS,
      });
    });

    test(`Should successfully get order (product mode)`, async () => {
      const inputSerial = 'order serial';
      axiosGetStub.resolves({
        data: {
          order: 'order serial',
          id: 'order serial',
          reference: 'DESAINEGMBH220510-3308-55135',
          buyerReference: null,
          ipAddress: '5.9.190.214',
          completed: true,
          changed: 1652170576496,
          changedValue: 1652170576496,
          changedInSeconds: 1652170576,
          changedDisplay: '5/10/22',
          changedDisplayISO8601: '2022-05-10',
          language: 'en',
          live: true,
          currency: 'USD',
          payoutCurrency: 'USD',
          quote: null,
          invoiceUrl:
            'https://venomsupply.test.onfastspring.com/popup-venomsupply/account/order/DESAINEGMBH220510-3308-55135/invoice/IV357D5QFPNND65C4RMTWBF24SLE',
          account: '4w0LKG1mSE6-HEnGCt5xkA',
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
            cardEnding: '4242',
          },
          customer: {
            first: 'John',
            last: 'Doe',
            email: 'tovaki7446@azteen.com',
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
                email: 'tovaki7446@azteen.com',
                company: 'Company Name',
                phone: '555-555-5555',
                subscribed: true,
                account: '4w0LKG1mSE6-HEnGCt5xkA',
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
            orderId: testObj.identifierGenerator.generateId(),
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
              subscription: 'LeabxoVwSoWEgmr4NKFqtw',
              fulfillments: {},
              withholdings: {
                taxWithholdings: false,
              },
            },
          ],
          action: 'order.get',
          result: 'success',
          orders: [
            {
              order: 'order serial',
              id: 'order serial',
              reference: 'DESAINEGMBH220510-3308-55135',
              buyerReference: null,
              ipAddress: '5.9.190.214',
              completed: true,
              changed: 1652170576496,
              changedValue: 1652170576496,
              changedInSeconds: 1652170576,
              changedDisplay: '5/10/22',
              changedDisplayISO8601: '2022-05-10',
              language: 'en',
              live: false,
              currency: 'USD',
              payoutCurrency: 'USD',
              quote: null,
              invoiceUrl:
                'https://venomsupply.test.onfastspring.com/popup-venomsupply/account/order/DESAINEGMBH220510-3308-55135/invoice/IV357D5QFPNND65C4RMTWBF24SLE',
              account: '4w0LKG1mSE6-HEnGCt5xkA',
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
                email: 'tovaki7446@azteen.com',
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
                    email: 'tovaki7446@azteen.com',
                    company: 'Company Name',
                    phone: '555-555-5555',
                    subscribed: true,
                    account: '4w0LKG1mSE6-HEnGCt5xkA',
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
                orderId: testObj.identifierGenerator.generateId(),
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
                  subscription: 'LeabxoVwSoWEgmr4NKFqtw',
                  fulfillments: {},
                  withholdings: {
                    taxWithholdings: false,
                  },
                },
              ],
              action: 'order.get',
              result: 'success',
            },
          ],
        },
      });
      const outputPaymentModel = new PaymentServiceModel();
      outputPaymentModel.serviceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputPaymentModel.mode = PaymentServiceModel.MODE_PRODUCT;
      testObj.paymentService.getAllPaymentMethod.resolves([null, [outputPaymentModel]]);

      const [error, result] = await testObj.fastspringApiRepository.getOrder(inputSerial);

      axiosGetStub.should.have.callCount(1);
      testObj.paymentService.getAllPaymentMethod.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(OrderModel).and.have.include({
        id: testObj.identifierGenerator.generateId(),
        orderSerial: 'order serial',
        serviceName: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        status: OrderModel.STATUS_SUCCESS,
        invoice:
          'https://venomsupply.test.onfastspring.com/popup-venomsupply/account/order/DESAINEGMBH220510-3308-55135/invoice/IV357D5QFPNND65C4RMTWBF24SLE',
      });
    });
  });

  suite(`Get product price`, () => {
    test(`Should error get product price`, async () => {
      const inputSerial = 'product serial';
      const apiError = new Error('API call error');
      axiosGetStub.throws(apiError);

      const [error] = await testObj.fastspringApiRepository.getProductPrice(inputSerial);

      axiosGetStub.should.have.callCount(1);
      expect(error).to.be.an.instanceof(ApiCallException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully get product price`, async () => {
      const inputSerial = 'product serial';
      axiosGetStub.resolves({
        data: {
          page: 1,
          limit: 50,
          products: [
            {
              action: 'product.price.get',
              result: 'success',
              product: 'at-datacenter-proxies-100',
              pricing: {
                PR: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                PS: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                PT: {
                  currency: 'EUR',
                  price: 100,
                  display: '100,00 €',
                  quantityDiscount: {},
                },
                PW: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                PY: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                QA: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                AD: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                AE: {
                  currency: 'USD',
                  price: 189,
                  display: '$189.00',
                  quantityDiscount: {},
                },
                AF: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                AG: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                AI: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                AL: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                AM: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                AN: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                AO: {
                  currency: 'USD',
                  price: 180,
                  display: '180,00 US$',
                  quantityDiscount: {},
                },
                AQ: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                AR: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$ 180,00',
                  quantityDiscount: {},
                },
                AS: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                AT: {
                  currency: 'EUR',
                  price: 100,
                  display: '€ 100,00',
                  quantityDiscount: {},
                },
                RE: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                AU: {
                  currency: 'AUD',
                  price: 290,
                  display: '$290.00',
                  quantityDiscount: {},
                },
                AW: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                AX: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                AZ: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                RO: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                BA: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                BB: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                RS: {
                  currency: 'EUR',
                  price: 100,
                  display: '100,00 EUR',
                  quantityDiscount: {},
                },
                BD: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                BE: {
                  currency: 'EUR',
                  price: 100,
                  display: '100,00 €',
                  quantityDiscount: {},
                },
                RU: {
                  currency: 'USD',
                  price: 216,
                  display: '216,00 $',
                  quantityDiscount: {},
                },
                BF: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                BG: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                RW: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                BH: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                BI: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                BJ: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                BL: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                BM: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                BN: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                BO: {
                  currency: 'USD',
                  price: 180,
                  display: 'USD180,00',
                  quantityDiscount: {},
                },
                SA: {
                  currency: 'USD',
                  price: 207,
                  display: '$207.00',
                  quantityDiscount: {},
                },
                BQ: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                SB: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                BR: {
                  currency: 'BRL',
                  price: 966,
                  display: 'R$ 966,00',
                  quantityDiscount: {},
                },
                SC: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                BS: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                SD: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                BT: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                SE: {
                  currency: 'SEK',
                  price: 2319,
                  display: '2 319,00 kr.',
                  quantityDiscount: {},
                },
                BV: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                SG: {
                  currency: 'SGD',
                  price: 277,
                  display: '$277.00',
                  quantityDiscount: {},
                },
                BW: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                SH: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                SI: {
                  currency: 'EUR',
                  price: 100,
                  display: '100,00 €',
                  quantityDiscount: {},
                },
                BY: {
                  currency: 'USD',
                  price: 216,
                  display: '$216.00',
                  quantityDiscount: {},
                },
                SJ: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                BZ: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                SK: {
                  currency: 'EUR',
                  price: 100,
                  display: '100,00 €',
                  quantityDiscount: {},
                },
                SL: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                SM: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                SN: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                SO: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                CA: {
                  currency: 'CAD',
                  price: 241,
                  display: '$241.00',
                  quantityDiscount: {},
                },
                SR: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                CC: {
                  currency: 'AUD',
                  price: 264,
                  display: '$264.00',
                  quantityDiscount: {},
                },
                SS: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                CD: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                ST: {
                  currency: 'USD',
                  price: 180,
                  display: '180,00 US$',
                  quantityDiscount: {},
                },
                CF: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                SV: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                CG: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                CH: {
                  currency: 'CHF',
                  price: 199,
                  display: 'CHF 199,00',
                  quantityDiscount: {},
                },
                SX: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                CI: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                SY: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                SZ: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                CK: {
                  currency: 'NZD',
                  price: 291,
                  display: '$291.00',
                  quantityDiscount: {},
                },
                CL: {
                  currency: 'CLP',
                  price: 194228,
                  display: '$194.228',
                  quantityDiscount: {},
                },
                CM: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                CN: {
                  currency: 'CNY',
                  price: 1267,
                  display: '￥1,267.00',
                  quantityDiscount: {},
                },
                CO: {
                  currency: 'COP',
                  price: 916522,
                  display: '$ 916.522,00',
                  quantityDiscount: {},
                },
                CR: {
                  currency: 'USD',
                  price: 180,
                  display: 'USD180,00',
                  quantityDiscount: {},
                },
                TC: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                TD: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                CU: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                TF: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                CV: {
                  currency: 'USD',
                  price: 180,
                  display: '180,00 US$',
                  quantityDiscount: {},
                },
                TG: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                CW: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                TH: {
                  currency: 'USD',
                  price: 192.6,
                  display: '$192.60',
                  quantityDiscount: {},
                },
                CX: {
                  currency: 'AUD',
                  price: 264,
                  display: '$264.00',
                  quantityDiscount: {},
                },
                CY: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                TJ: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                CZ: {
                  currency: 'CZK',
                  price: 5460,
                  display: '5 460,00 Kč',
                  quantityDiscount: {},
                },
                TK: {
                  currency: 'NZD',
                  price: 291,
                  display: '$291.00',
                  quantityDiscount: {},
                },
                TL: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                TM: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                TN: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                TO: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                TR: {
                  currency: 'USD',
                  price: 212.4,
                  display: '$212,40',
                  quantityDiscount: {},
                },
                TT: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                DE: {
                  currency: 'EUR',
                  price: 100,
                  display: '100,00 €',
                  quantityDiscount: {},
                },
                TV: {
                  currency: 'AUD',
                  price: 264,
                  display: '$264.00',
                  quantityDiscount: {},
                },
                TW: {
                  currency: 'USD',
                  price: 189,
                  display: 'US$189.00',
                  quantityDiscount: {},
                },
                DJ: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                TZ: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                DK: {
                  currency: 'DKK',
                  price: 1644,
                  display: '1.644,00 kr.',
                  quantityDiscount: {},
                },
                DM: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                DO: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                UA: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                UG: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                DZ: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                UM: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                EC: {
                  currency: 'USD',
                  price: 180,
                  display: '$180,00',
                  quantityDiscount: {},
                },
                US: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                EE: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                EG: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                EH: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                UY: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$ 180,00',
                  quantityDiscount: {},
                },
                UZ: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                VA: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                ER: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                VC: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                ES: {
                  currency: 'EUR',
                  price: 100,
                  display: '100,00 €',
                  quantityDiscount: {},
                },
                ET: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                VE: {
                  currency: 'USD',
                  price: 180,
                  display: 'USD180,00',
                  quantityDiscount: {},
                },
                VG: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                VI: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                VN: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                VU: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                FI: {
                  currency: 'EUR',
                  price: 100,
                  display: '100,00 €',
                  quantityDiscount: {},
                },
                FJ: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                FK: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                FM: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                FO: {
                  currency: 'DKK',
                  price: 1315,
                  display: 'DKK1,315.00',
                  quantityDiscount: {},
                },
                FR: {
                  currency: 'EUR',
                  price: 100,
                  display: '100,00 €',
                  quantityDiscount: {},
                },
                WF: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                GA: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                GB: {
                  currency: 'GBP',
                  price: 182,
                  display: '£182.00',
                  quantityDiscount: {},
                },
                WS: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                GD: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                GE: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                GF: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                GG: {
                  currency: 'GBP',
                  price: 152,
                  display: '£152.00',
                  quantityDiscount: {},
                },
                GH: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                GI: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                GL: {
                  currency: 'DKK',
                  price: 1315,
                  display: 'DKK1,315.00',
                  quantityDiscount: {},
                },
                GM: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                GN: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                GP: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                GQ: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                GR: {
                  currency: 'EUR',
                  price: 100,
                  display: '100,00 €',
                  quantityDiscount: {},
                },
                GS: {
                  currency: 'GBP',
                  price: 152,
                  display: '£152.00',
                  quantityDiscount: {},
                },
                GT: {
                  currency: 'USD',
                  price: 180,
                  display: 'USD180.00',
                  quantityDiscount: {},
                },
                GU: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                GW: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                GY: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                HK: {
                  currency: 'HKD',
                  price: 1463,
                  display: 'HK$1,463.00',
                  quantityDiscount: {},
                },
                HM: {
                  currency: 'AUD',
                  price: 264,
                  display: 'A$264.00',
                  quantityDiscount: {},
                },
                HN: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                HR: {
                  currency: 'EUR',
                  price: 125,
                  display: '125,00 EUR',
                  quantityDiscount: {},
                },
                HT: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                YE: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                HU: {
                  currency: 'EUR',
                  price: 127,
                  display: '127,00 EUR',
                  quantityDiscount: {},
                },
                IC: {
                  currency: 'EUR',
                  price: 100,
                  display: '100,00 €',
                  quantityDiscount: {},
                },
                ID: {
                  currency: 'USD',
                  price: 199.8,
                  display: '$199.80',
                  quantityDiscount: {},
                },
                YT: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                IE: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                IL: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                IM: {
                  currency: 'GBP',
                  price: 152,
                  display: '£152.00',
                  quantityDiscount: {},
                },
                IN: {
                  currency: 'INR',
                  price: 17245,
                  display: '₹ 17,245.00',
                  quantityDiscount: {},
                },
                IO: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                ZA: {
                  currency: 'USD',
                  price: 207,
                  display: 'US$207,00',
                  quantityDiscount: {},
                },
                IQ: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                IR: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                IS: {
                  currency: 'EUR',
                  price: 124,
                  display: '€124.00',
                  quantityDiscount: {},
                },
                IT: {
                  currency: 'EUR',
                  price: 100,
                  display: '100,00 €',
                  quantityDiscount: {},
                },
                ZM: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                JE: {
                  currency: 'GBP',
                  price: 152,
                  display: '£152.00',
                  quantityDiscount: {},
                },
                ZW: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                JM: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                JO: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                JP: {
                  currency: 'JPY',
                  price: 26759,
                  display: '¥26,759',
                  quantityDiscount: {},
                },
                KE: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                KG: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                KH: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                KI: {
                  currency: 'AUD',
                  price: 264,
                  display: '$264.00',
                  quantityDiscount: {},
                },
                KM: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                KN: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                KP: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                KR: {
                  currency: 'KRW',
                  price: 265500,
                  display: '₩265,500',
                  quantityDiscount: {},
                },
                KW: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                KY: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                KZ: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                LA: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                LB: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                LC: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                LI: {
                  currency: 'CHF',
                  price: 185,
                  display: 'CHF185.00',
                  quantityDiscount: {},
                },
                LK: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                LR: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                LS: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                LT: {
                  currency: 'EUR',
                  price: 100,
                  display: '100,00 €',
                  quantityDiscount: {},
                },
                LU: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                LV: {
                  currency: 'EUR',
                  price: 100,
                  display: '100,00 €',
                  quantityDiscount: {},
                },
                LY: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                MA: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                MC: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                MD: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                ME: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                MF: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                MG: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                MH: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                MK: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                ML: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                MM: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                MN: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                MO: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                MP: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                MQ: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                MR: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                MS: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                MT: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                MU: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                MV: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                MW: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                MX: {
                  currency: 'MXN',
                  price: 3829,
                  display: '$3,829.00',
                  quantityDiscount: {},
                },
                MY: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                MZ: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                NA: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                NC: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                NE: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                NF: {
                  currency: 'AUD',
                  price: 264,
                  display: '$264.00',
                  quantityDiscount: {},
                },
                NG: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                NI: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                NL: {
                  currency: 'EUR',
                  price: 100,
                  display: '€ 100,00',
                  quantityDiscount: {},
                },
                NO: {
                  currency: 'EUR',
                  price: 125,
                  display: '€ 125,00',
                  quantityDiscount: {},
                },
                NP: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                NR: {
                  currency: 'AUD',
                  price: 264,
                  display: '$264.00',
                  quantityDiscount: {},
                },
                NU: {
                  currency: 'NZD',
                  price: 291,
                  display: '$291.00',
                  quantityDiscount: {},
                },
                NZ: {
                  currency: 'NZD',
                  price: 335,
                  display: '$335.00',
                  quantityDiscount: {},
                },
                OM: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                PA: {
                  currency: 'USD',
                  price: 180,
                  display: 'USD180.00',
                  quantityDiscount: {},
                },
                PE: {
                  currency: 'USD',
                  price: 180,
                  display: 'USD180.00',
                  quantityDiscount: {},
                },
                PF: {
                  currency: 'USD',
                  price: 180,
                  display: '$180.00',
                  quantityDiscount: {},
                },
                PG: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                PH: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                PK: {
                  currency: 'USD',
                  price: 180,
                  display: 'US$180.00',
                  quantityDiscount: {},
                },
                PL: {
                  currency: 'PLN',
                  price: 1045,
                  display: '1 045,00 zł',
                  quantityDiscount: {},
                },
                PM: {
                  currency: 'EUR',
                  price: 100,
                  display: '€100.00',
                  quantityDiscount: {},
                },
                PN: {
                  currency: 'NZD',
                  price: 291,
                  display: '$291.00',
                  quantityDiscount: {},
                },
              },
            },
          ],
        },
      });

      const [error, result] = await testObj.fastspringApiRepository.getProductPrice(inputSerial);

      axiosGetStub.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(ExternalStoreModel).and.have.include({
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: inputSerial,
      });
      expect(result.price[0]).to.have.include({
        value: 180,
        unit: 'USD',
        country: 'PR',
      });
    });
  });

  suite(`Get subscription`, () => {
    test(`Should error get subscription`, async () => {
      const inputSerial = 'subscription serial';
      const apiError = new Error('API call error');
      axiosGetStub.throws(apiError);

      const [error] = await testObj.fastspringApiRepository.getSubscription(inputSerial);

      axiosGetStub.should.have.callCount(1);
      expect(error).to.be.an.instanceof(ApiCallException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully get subscription`, async () => {
      const inputSerial = 'subscription serial';
      axiosGetStub.resolves({
        data: {
          id: 'subscription serial',
          quote: null,
          subscription: 'subscription serial',
          active: true,
          state: 'active',
          changed: 1651996943051,
          changedValue: 1651996943051,
          changedInSeconds: 1651996943,
          changedDisplay: '5/8/22',
          changedDisplayISO8601: '2022-05-08',
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
          tags: {
            orderId: testObj.identifierGenerator.generateId(),
          },
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
          paymentReminder: {
            intervalUnit: 'week',
            intervalLength: 1,
          },
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
          initialOrderId: 'Gr50yZnQT2SPN3SOo8OPcA',
          initialOrderReference: 'DESAINEGMBH220501-1274-60244',
          action: 'subscription.get',
          result: 'success',
          subscriptions: [
            {
              id: 'subscription serial',
              quote: null,
              subscription: 'subscription serial',
              active: true,
              state: 'active',
              changed: 1651996943825,
              changedValue: 1651996943825,
              changedInSeconds: 1651996943,
              changedDisplay: '5/8/22',
              changedDisplayISO8601: '2022-05-08',
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
              tags: {
                orderId: testObj.identifierGenerator.generateId(),
              },
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
              paymentReminder: {
                intervalUnit: 'week',
                intervalLength: 1,
              },
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
              initialOrderId: 'Gr50yZnQT2SPN3SOo8OPcA',
              initialOrderReference: 'DESAINEGMBH220501-1274-60244',
              action: 'subscription.get',
              result: 'success',
            },
          ],
        },
      });

      const [error, result] = await testObj.fastspringApiRepository.getSubscription(inputSerial);

      axiosGetStub.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(SubscriptionModel).and.have.include({
        orderId: testObj.identifierGenerator.generateId(),
        serial: inputSerial,
        status: SubscriptionModel.STATUS_ACTIVATED,
      });
    });
  });

  suite(`Cancel subscription`, () => {
    test(`Should error cancel subscription`, async () => {
      const inputSerial = 'subscription serial';
      const apiError = new Error('API call error');
      axiosDeleteStub.throws(apiError);

      const [error] = await testObj.fastspringApiRepository.cancelSubscription(inputSerial);

      axiosDeleteStub.should.have.callCount(1);
      expect(error).to.be.an.instanceof(ApiCallException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error cancel subscription when already canceled`, async () => {
      const inputSerial = 'subscription serial';
      const apiError = new Error('API call error');
      apiError.response = {
        status: 400,
        data: {
          subscriptions: [
            {
              action: 'subscription.cancel',
              subscription: 'subscription serial',
              result: 'success',
              error: {
                subscription: 'The subscription is already canceled',
              },
            },
          ],
        },
      };
      axiosDeleteStub.throws(apiError);

      const [error] = await testObj.fastspringApiRepository.cancelSubscription(inputSerial);

      axiosDeleteStub.should.have.callCount(1);
      expect(error).to.be.an.instanceof(FastspringAlreadyCanceledException);
      expect(error).to.have.property('httpCode', 400);
    });
  });
});
