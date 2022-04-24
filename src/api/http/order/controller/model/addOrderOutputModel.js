/**
 * Created by pooya on 4/24/22.
 */

const BaseOrderOutputModel = require('./baseOrderOutputModel');

class AddOrderOutputModel {
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
   * @param {OrderModel} model
   * @return {Object}
   */
  getOutput(model) {
    const baseProductOutputModel = new BaseOrderOutputModel(this.#dateTime);

    return baseProductOutputModel.getOutput(model);
  }
}

module.exports = AddOrderOutputModel;
