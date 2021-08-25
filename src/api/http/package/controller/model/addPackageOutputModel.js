/**
 * Created by pooya on 8/25/21.
 */

const BasePackageOutputModel = require('./basePackageOutputModel');

class AddPackageOutputModel {
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
   * @param {PackageModel} model
   * @return {{}}
   */
  getOutput(model) {
    const basePackageOutputModel = new BasePackageOutputModel(this.#dateTime);

    return basePackageOutputModel.getOutput(model);
  }
}

module.exports = AddPackageOutputModel;
