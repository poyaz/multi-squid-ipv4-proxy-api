/**
 * Created by pooya on 2/12/22.
 */

const baseServerOutputModel = require('./baseServerOutputModel');

class GetAllServerOutputModel {
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
   * @param {Array<ServerModel>} models
   * @return {Array<{}>}
   */
  getOutput(models) {
    const baseUserOutputModel = new baseServerOutputModel(this.#dateTime);

    return models.map((v) => baseUserOutputModel.getOutput(v));
  }
}

module.exports = GetAllServerOutputModel;
