/**
 * Created by pooya on 4/24/22.
 */

const OrderModel = require('~src/core/model/orderModel');

class VerifyOrderPackageInputModel {
  /**
   * @type {string}
   */
  #orderId;

  /**
   *
   * @param {string} orderId
   */
  constructor(orderId) {
    this.#orderId = orderId;
  }

  /**
   *
   * @param body
   * @return {OrderModel}
   */
  getModel(body) {
    const model = new OrderModel();
    model.id = this.#orderId;
    model.orderSerial = body.orderSerial;

    return model;
  }
}

module.exports = VerifyOrderPackageInputModel;
