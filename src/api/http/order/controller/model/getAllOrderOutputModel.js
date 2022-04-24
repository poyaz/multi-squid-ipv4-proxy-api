/**
 * Created by pooya on 4/24/22.
 */

const BaseOrderOutputModel = require('./baseOrderOutputModel');

class GetAllOrderOutputModel {
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
   * @param {Array<OrderModel>} models
   * @return {Array<{}>}
   */
  getOutput(models) {
    const baseProductOutputModel = new BaseOrderOutputModel(this.#dateTime);

    return models.map((v) => baseProductOutputModel.getOutput(v));
  }
}

module.exports = GetAllOrderOutputModel;
