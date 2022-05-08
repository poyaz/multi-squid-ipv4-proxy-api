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
const ApiCallException = require('~src/core/exception/apiCallException');
const UnknownException = require('~src/core/exception/unknownException');
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
    const { fastspringApiRepository } = helper.fakeFastspringApiRepository();

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
