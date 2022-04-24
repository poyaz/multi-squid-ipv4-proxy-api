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
 * @property {string} status
 * @property {string} lastSubscriptionStatus
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
  status = undefined;
  lastSubscriptionStatus = undefined;
  orderBodyData = undefined;
  insertDate = undefined;
  updateDate = undefined;
}

module.exports = OrderModel;
