/**
 * Created by pooya on 4/17/22.
 */

const ProductModel = require('~src/core/model/productModel');

class UpdateProductInputModel {
  #id;

  constructor(id) {
    this.#id = id;
  }

  /**
   *
   * @param body
   * @return {ProductModel}
   */
  getModel(body) {
    const model = new ProductModel();
    model.id = this.#id;
    model.count = body.count;
    model.price = body.price;
    model.expireDay = body.expireDay;
    model.isEnable = body.isEnable;

    return model;
  }
}

module.exports = UpdateProductInputModel;
