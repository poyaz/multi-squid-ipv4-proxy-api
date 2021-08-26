/**
 * Created by pooya on 8/25/21.
 */

const BasePackageOutputModel = require('./basePackageOutputModel');

class GetAllByUsernamePackageOutputModel {
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
   * @param {Array<PackageModel>} models
   * @return {{}}
   */
  getOutput(models) {
    const basePackageOutputModel = new BasePackageOutputModel(this.#dateTime);

    return models.map((v) => basePackageOutputModel.getOutput(v));
  }
}

module.exports = GetAllByUsernamePackageOutputModel;
