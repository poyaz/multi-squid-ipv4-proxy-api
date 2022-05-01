/**
 * Created by pooya on 4/24/22.
 */

const OrderModel = require('~src/core/model/orderModel');

class AddOrderInputModel {
  /**
   * @type {string}
   */
  #userId;

  /**
   *
   * @param {string} userId
   */
  constructor(userId) {
    this.#userId = userId;
  }

  /**
   *
   * @param body
   * @return {OrderModel}
   */
  getModel(body) {
    const model = new OrderModel();
    model.userId = this.#userId;
    model.productId = body.productId;
    model.serviceName = body.serviceName;
    model.prePackageOrderInfo = {
      proxyType: body.prePackageOrderInfo.proxyType,
      countryCode: body.prePackageOrderInfo.countryCode.toUpperCase(),
    };

    return model;
  }
}

module.exports = AddOrderInputModel;
