/**
 * Created by pooya on 8/29/21.
 */

const PaymentController = require('./paymentController');

class PaymentControllerFactory {
  /**
   * @type {IPaymentService}
   */
  #paymentService;

  /**
   *
   * @param {IPaymentService} paymentService
   */
  constructor(paymentService) {
    this.#paymentService = paymentService;
  }

  /**
   *
   * @param req
   * @param res
   * @return {PaymentController}
   */
  create(req, res) {
    return new PaymentController(req, res, this.#paymentService);
  }
}

module.exports = PaymentControllerFactory;
