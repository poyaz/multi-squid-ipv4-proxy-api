/**
 * Created by pooya on 4/17/22.
 */

const ExternalStoreModel = require('~src/core/model/externalStoreModel');

class AddExternalStoreProductInputModel {
  #productId;

  constructor(productId) {
    this.#productId = productId;
  }

  /**
   *
   * @param body
   * @return {ExternalStoreModel}
   */
  getModel(body) {
    const model = new ExternalStoreModel();
    model.productId = this.#productId;
    model.type = body.type;
    model.serial = body.serial;

    return model;
  }
}

module.exports = AddExternalStoreProductInputModel;
