/**
 * Created by pooya on 4/17/22.
 */

const BaseProductOutputModel = require('./baseProductOutputModel');

class AddProductOutputModel {
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
   * @param {ProductModel} model
   * @return {{}}
   */
  getOutput(model) {
    const baseProductOutputModel = new BaseProductOutputModel(this.#dateTime);

    return baseProductOutputModel.getOutput(model);
  }
}

module.exports = AddProductOutputModel;
