/**
 * Created by pooya on 4/17/22.
 */

class AddExternalStoreProductOutputModel {
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
   * @param {ExternalStoreModel} model
   * @return {{}}
   */
  getOutput(model) {
    const obj = {};
    obj.id = model.id;
    obj.productId = model.productId;
    obj.type = model.type;
    obj.serial = model.serial;
    obj.price = model.price.map((v) => ({
      unit: v.unit.toUpperCase(),
      value: v.value,
      country: v.country.toUpperCase(),
    }));
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

module.exports = AddExternalStoreProductOutputModel;
