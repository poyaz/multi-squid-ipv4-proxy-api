/**
 * Created by pooya on 4/17/22.
 */

const BaseProductOutputModel = require('./baseProductOutputModel');

class GetAllEnableProductOutputModel {
  /**
   * @type {IDateTime}
   */
  #dateTime;

  /**
   *
   * @param {IDateTime} dateTime
   */
  constructor(dateTime) {
    this.#dateTime = dateTime;
  }

  /**
   *
   * @param {Array<ProductModel>} models
   * @return {Array<{}>}
   */
  getOutput(models) {
    const baseProductOutputModel = new BaseProductOutputModel(this.#dateTime);

    return models
      .map((v) => baseProductOutputModel.getOutput(v))
      .map((v) => delete v.isEnable && v);
  }
}

module.exports = GetAllEnableProductOutputModel;
