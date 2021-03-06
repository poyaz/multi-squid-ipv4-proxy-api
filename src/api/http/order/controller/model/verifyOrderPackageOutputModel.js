/**
 * Created by pooya on 8/25/21.
 */

class VerifyOrderPackageOutputModel {
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
    const obj = {};
    obj.id = model.id;
    obj.userId = model.userId;
    obj.username = model.username;
    obj.password = model.password;
    obj.countIp = model.countIp;
    obj.type = model.type;
    obj.country = model.country.toUpperCase();
    obj.ipList = model.ipList.map((v) => ({ ip: v.ip, port: v.port }));
    obj.status = model.status;
    obj.insertDate = this._gregorianWithTimezoneString(model.insertDate);
    obj.updateDate = this._gregorianWithTimezoneString(model.updateDate);
    obj.expireDate = this._gregorianExpireDateWithTimezoneString(model.expireDate);

    return obj;
  }

  _gregorianWithTimezoneString(date) {
    if (!date) {
      return null;
    }

    return this.#dateTime.gregorianWithTimezoneString(date);
  }

  _gregorianExpireDateWithTimezoneString(date) {
    if (!date) {
      return null;
    }

    return this.#dateTime.gregorianWithTimezoneString(date).split(' ')[0];
  }
}

module.exports = VerifyOrderPackageOutputModel;
