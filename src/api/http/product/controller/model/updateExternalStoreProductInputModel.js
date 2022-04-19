/**
 * Created by pooya on 4/17/22.
 */

const ExternalStoreModel = require('~src/core/model/externalStoreModel');

class UpdateExternalStoreProductInputModel {
  #productId;
  #externalStoreId;

  constructor(productId, externalStoreId) {
    this.#productId = productId;
    this.#externalStoreId = externalStoreId;
  }

  /**
   *
   * @param body
   * @return {ExternalStoreModel}
   */
  getModel(body) {
    const model = new ExternalStoreModel();
    model.id = this.#externalStoreId;
    model.productId = this.#productId;
    model.type = body.type;
    model.serial = body.serial;

    return model;
  }
}

module.exports = UpdateExternalStoreProductInputModel;
