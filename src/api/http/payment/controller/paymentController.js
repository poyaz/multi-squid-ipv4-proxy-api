/**
 * Created by pooya on 5/11/22.
 */

const GetAllPaymentMethodOutputModel = require('./model/getAllPaymentMethodOutputModel');

class PaymentController {
  #req;
  #res;
  /**
   * @type {IPaymentService}
   */
  #paymentService;

  /**
   *
   * @param req
   * @param res
   * @param {IPaymentService} paymentService
   */
  constructor(req, res, paymentService) {
    this.#req = req;
    this.#res = res;
    this.#paymentService = paymentService;
  }

  async getAllPaymentMethod() {
    const [error, data] = await this.#paymentService.getAllPaymentMethod();
    if (error) {
      return [error];
    }

    const getAllPaymentMethodOutputModel = new GetAllPaymentMethodOutputModel();
    const result = getAllPaymentMethodOutputModel.getOutput(data);

    return [null, result];
  }
}

module.exports = PaymentController;
