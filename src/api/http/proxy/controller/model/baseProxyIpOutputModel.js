/**
 * Created by pooya on 8/23/21.
 */

class BaseProxyIpOutputModel {
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
   * @param {IpAddressModel} model
   * @return {{}}
   */
  getOutput(model) {
    const obj = {};
    obj.id = model.id;
    obj.ip = model.ip;
    obj.port = model.port;
    obj.mask = model.mask;
    obj.gateway = model.gateway;
    obj.interface = model.interface;
    obj.insertDate = this._gregorianWithTimezoneString(model.insertDate);

    return obj;
  }

  _gregorianWithTimezoneString(date) {
    if (!date) {
      return null;
    }

    return this.#dateTime.gregorianWithTimezoneString(date);
  }
}

module.exports = BaseProxyIpOutputModel;
