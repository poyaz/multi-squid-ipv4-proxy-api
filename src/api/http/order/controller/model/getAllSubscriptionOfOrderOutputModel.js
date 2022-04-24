/**
 * Created by pooya on 4/24/22.
 */

const BaseSubscriptionOutputModel = require('./baseSubscriptionOutputModel');

class GetAllSubscriptionOfOrderOutputModel {
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
   * @param {Array<SubscriptionModel>} models
   * @return {Array<{}>}
   */
  getOutput(models) {
    const baseProductOutputModel = new BaseSubscriptionOutputModel(this.#dateTime);

    return models.map((v) => baseProductOutputModel.getOutput(v));
  }
}

module.exports = GetAllSubscriptionOfOrderOutputModel;
