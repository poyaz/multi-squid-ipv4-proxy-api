/**
 * Created by pooya on 8/25/21.
 */

const PackageModel = require('~src/core/model/packageModel');

class RenewPackageInputModel {
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
   * @return {Date}
   */
  getModel(body) {
    return this.#dateTime.gregorianDateWithTimezone(body.expire, 'YYYY-MM-DD');
  }
}

module.exports = RenewPackageInputModel;
