/**
 * Created by pooya on 8/25/21.
 */

const BaseUserOutputModel = require('./baseUserOutputModel');

class GetAllUserOutputModel {
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
   * @param {Array<UserModel>} models
   * @return {Array<{}>}
   */
  getOutput(models) {
    const baseUserOutputModel = new BaseUserOutputModel(this.#dateTime);

    return models.map((v) => baseUserOutputModel.getOutput(v));
  }
}

module.exports = GetAllUserOutputModel;
