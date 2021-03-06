/**
 * Created by pooya on 8/23/21.
 */

const BaseUserOutputModel = require('./baseUserOutputModel');

class AddUserOutputModel {
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
   * @param {UserModel} model
   * @return {{}}
   */
  getOutput(model) {
    const baseUserOutputModel = new BaseUserOutputModel(this.#dateTime);

    return baseUserOutputModel.getOutput(model);
  }
}

module.exports = AddUserOutputModel;
