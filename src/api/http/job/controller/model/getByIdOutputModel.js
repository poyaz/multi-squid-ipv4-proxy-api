/**
 * Created by pooya on 8/31/21.
 */

const BaseJobOutputModel = require('./baseJobOutputModel');

class GetByIdOutputModel {
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
   * @param {JobModel} model
   * @return {Object}
   */
  getOutput(model) {
    const baseUserOutputModel = new BaseJobOutputModel(this.#dateTime);

    return baseUserOutputModel.getOutput(model);
  }
}

module.exports = GetByIdOutputModel;
