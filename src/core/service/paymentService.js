/**
 * Created by pooya on 5/11/22.
 */

const IPaymentService = require('~src/core/interface/iPaymentService');
const PaymentServiceModel = require('~src/core/model/paymentServiceModel');
const ExternalStoreModel = require('~src/core/model/externalStoreModel');
const DisablePaymentException = require('~src/core/exception/disablePaymentException');

class PaymentService extends IPaymentService {
  /**
   * @type {boolean}
   */
  #isPaymentEnable;
  /**
   * @type Array<PaymentServiceModel>
   */
  #paymentList = [];

  /**
   *
   * @param {boolean} isPaymentEnable
   * @param {string} fastspringStoreUrl
   */
  constructor(isPaymentEnable, fastspringStoreUrl) {
    super();

    this.#isPaymentEnable = isPaymentEnable;

    if (fastspringStoreUrl) {
      const fastspringPayment = new PaymentServiceModel();
      fastspringPayment.serviceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      fastspringPayment.mode = fastspringStoreUrl.match(/test\./g)
        ? PaymentServiceModel.MODE_TEST
        : PaymentServiceModel.MODE_PRODUCT;
      fastspringPayment.address = fastspringStoreUrl;

      this.#paymentList.push(fastspringPayment);
    }
  }

  async getAllPaymentMethod() {
    if (!this.#isPaymentEnable) {
      return [new DisablePaymentException()];
    }

    return [null, this.#paymentList];
  }
}

module.exports = PaymentService;
