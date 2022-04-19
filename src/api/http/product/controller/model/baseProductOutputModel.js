/**
 * Created by pooya on 4/17/22.
 */

class BaseProductOutputModel {
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
   * @param {ProductModel} model
   * @return {{}}
   */
  getOutput(model) {
    const obj = {};
    obj.id = model.id;
    obj.count = model.count;
    obj.price = model.price;
    obj.expireDay = model.expireDay;
    obj.externalStore = model.externalStore.map((v) => ({
      id: v.id,
      type: v.type,
      serial: v.serial,
      insertDate: this._gregorianWithTimezoneString(model.insertDate),
    }));
    obj.isEnable = model.isEnable;
    obj.insertDate = this._gregorianWithTimezoneString(model.insertDate);
    obj.updateDate = this._gregorianWithTimezoneString(model.updateDate);
    obj.deleteDate = this._gregorianWithTimezoneString(model.deleteDate);

    return obj;
  }

  _gregorianWithTimezoneString(date) {
    if (!date) {
      return null;
    }

    return this.#dateTime.gregorianWithTimezoneString(date);
  }
}

module.exports = BaseProductOutputModel;
