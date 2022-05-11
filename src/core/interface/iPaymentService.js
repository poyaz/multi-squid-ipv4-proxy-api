/**
 * Created by pooya on 8/30/21.
 */

class IPaymentService {
  /**
   *
   * @return {Promise<(Error|Array<PaymentServiceModel>|[])[]>}
   */
  async getAllPaymentMethod() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
    throw error;
  }
}

module.exports = IPaymentService;
