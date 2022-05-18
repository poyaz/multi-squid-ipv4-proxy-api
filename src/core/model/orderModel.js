/**
 * Created by pooya on 4/10/22.
 */

/**
 * @property {string} id
 * @property {string} userId
 * @property {string} productId
 * @property {string} packageId
 * @property {string} orderSerial
 * @property {string} serviceName
 * @property {string} username
 * @property {string} status
 * @property {string} lastSubscriptionStatus
 * @property {string} invoice
 * @property {Object<{count: number, expireDay: number, proxyType: string, countryCode: string}>} prePackageOrderInfo
 * @property {string} body
 * @property {Date} insertDate
 * @property {Date} updateDate
 */
class OrderModel {
  static STATUS_SUCCESS = 'success';
  static STATUS_FAIL = 'fail';

  id = undefined;
  userId = undefined;
  productId = undefined;
  packageId = undefined;
  orderSerial = undefined;
  serviceName = undefined;
  username = undefined;
  status = undefined;
  lastSubscriptionStatus = undefined;
  invoice = undefined;
  prePackageOrderInfo = undefined;
  orderBodyData = undefined;
  insertDate = undefined;
  updateDate = undefined;
}

module.exports = OrderModel;
