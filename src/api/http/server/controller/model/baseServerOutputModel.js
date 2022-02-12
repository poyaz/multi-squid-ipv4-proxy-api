/**
 * Created by pooya on 2/12/22.
 */

class BaseServerOutputModel {
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
   * @param {ServerModel} model
   * @return {{}}
   */
  getOutput(model) {
    const obj = {};
    obj.id = model.id;
    obj.name = model.name;
    obj.ipRange = model.ipRange;
    obj.hostIpAddress = model.hostIpAddress;
    obj.hostApiPort = model.hostApiPort;
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

module.exports = BaseServerOutputModel;
