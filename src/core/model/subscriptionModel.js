/**
 * Created by pooya on 4/20/22.
 */

/**
 * @property {string} id
 * @property {string} orderId
 * @property {string} flag
 * @property {boolean} isEnable
 * @property {string} body
 * @property {Date} insertDate
 * @property {Date} updateDate
 */
class SubscriptionModel {
  static STATUS_ACTIVATED = 'activated';
  static STATUS_DEACTIVATED = 'deactivated';
  static STATUS_CANCELED = 'canceled';
  static STATUS_UNCANCELED = 'uncanceled';
  static STATUS_CHARGE_COMPLETED = 'completed';
  static STATUS_CHARGE_FAILED = 'failed';

  id = undefined;
  orderId = undefined;
  status = undefined;
  isEnable = undefined;
  body = undefined;
  insertDate = undefined;
  updateDate = undefined;
}

module.exports = SubscriptionModel;
