/**
 * Created by pooya on 4/17/22.
 */

class BaseOrderOutputModel {
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
   * @param {OrderModel} model
   * @return {{}}
   */
  getOutput(model) {
    const obj = {};
    obj.id = model.id;
    obj.userId = model.userId;
    obj.productId = model.productId;
    obj.packageId = typeof model.packageId === 'undefined' ? null : model.packageId;
    obj.orderSerial = model.orderSerial;
    obj.serviceName = model.serviceName;
    obj.status = model.status;
    obj.lastSubscriptionStatus =
      typeof model.lastSubscriptionStatus === 'undefined' ? null : model.lastSubscriptionStatus;
    obj.prePackageOrderInfo = {
      count: model.prePackageOrderInfo.count,
      expireDay: model.prePackageOrderInfo.expireDay,
      proxyType: model.prePackageOrderInfo.proxyType,
      countryCode: model.prePackageOrderInfo.countryCode.toUpperCase(),
    };
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

module.exports = BaseOrderOutputModel;
