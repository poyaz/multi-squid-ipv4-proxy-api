/**
 * Created by pooya on 8/25/21.
 */

const PackageModel = require('~src/core/model/packageModel');

class AddPackageInputModel {
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
   * @param body
   * @return {PackageModel}
   */
  getModel(body) {
    const model = new PackageModel();
    model.username = body.username;
    model.countIp = body.count;
    model.type = body.type;
    model.country = body.country.toUpperCase();
    model.expireDate = body.expire
      ? this.#dateTime.gregorianDateWithTimezone(body.expire, 'YYYY-MM-DD')
      : null;

    return model;
  }
}

module.exports = AddPackageInputModel;
