/**
 * Created by pooya on 5/11/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const PaymentServiceModel = require('~src/core/model/paymentServiceModel');
const ExternalStoreModel = require('~src/core/model/externalStoreModel');
const DisablePaymentException = require('~src/core/exception/disablePaymentException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`PackageService`, () => {
  setup(() => {
    const {
      packageServiceDisable,
      packageServiceEnableEmpty,
      packageServiceEnable,
    } = helper.fakePaymentService();

    testObj.packageServiceDisable = packageServiceDisable;
    testObj.packageServiceEnableEmpty = packageServiceEnableEmpty;
    testObj.packageServiceEnable = packageServiceEnable;
  });

  suite(`Get all payment method`, () => {
    test(`Should error when payment method is disable`, async () => {
      const [error] = await testObj.packageServiceDisable.getAllPaymentMethod();

      expect(error).to.be.an.instanceof(DisablePaymentException);
    });

    test(`Should successfully payment method with empty list if payment enable but not register any record`, async () => {
      const [error, result] = await testObj.packageServiceEnableEmpty.getAllPaymentMethod();

      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should successfully payment method with data`, async () => {
      const [error, result] = await testObj.packageServiceEnable.getAllPaymentMethod();

      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.instanceOf(PaymentServiceModel).and.have.include({
        serviceName: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        mode: PaymentServiceModel.MODE_TEST,
        address: 'test.fastspring.com',
      });
    });
  });
});
