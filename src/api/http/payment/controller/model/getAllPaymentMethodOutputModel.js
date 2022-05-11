/**
 * Created by pooya on 5/11/22.
 */

class GetAllPaymentMethodOutputModel {
  /**
   *
   * @param {Array<PaymentServiceModel>} models
   * @return {{}}
   */
  getOutput(models) {
    return models.map((v) => ({
      serviceName: v.serviceName,
      mode: v.mode,
      address: v.address,
    }));
  }
}

module.exports = GetAllPaymentMethodOutputModel;
