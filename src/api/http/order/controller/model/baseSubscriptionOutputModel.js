/**
 * Created by pooya on 4/17/22.
 */

class BaseSubscriptionOutputModel {
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
   * @param {SubscriptionModel} model
   * @return {{}}
   */
  getOutput(model) {
    const obj = {};
    obj.id = model.id;
    obj.orderId = model.orderId;
    obj.status = model.status;
    obj.insertDate = this._gregorianWithTimezoneString(model.insertDate);
    obj.updateDate = this._gregorianWithTimezoneString(model.updateDate);

    return obj;
  }

  _gregorianWithTimezoneString(date) {
    if (!date) {
      return null;
    }

    return this.#dateTime.gregorianWithTimezoneString(date);
  }
}

module.exports = BaseSubscriptionOutputModel;
