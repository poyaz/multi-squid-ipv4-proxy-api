/**
 * Created by pooya on 4/17/22.
 */

const ProductModel = require('~src/core/model/productModel');

class AddProductInputModel {
  /**
   *
   * @param body
   * @return {ProductModel}
   */
  getModel(body) {
    const model = new ProductModel();
    model.count = body.count;
    model.price = body.price;
    model.expireDay = body.expireDay;
    model.externalStore = body.externalStore.map((v) => ({
      type: v.type,
      serial: v.serial,
    }));
    model.isEnable = body.isEnable;

    return model;
  }
}

module.exports = AddProductInputModel;
