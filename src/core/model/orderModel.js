/**
 * Created by pooya on 4/10/22.
 */

class OrderModel {
  static STATUS_SUCCESS = 'success';
  static STATUS_FAIL = 'fail';
  static STATUS_PENDING = 'pending';
  static STATUS_CANCEL = 'cancel';

  id = undefined;
  userId = undefined;
  packageId = undefined;
  orderSerial = undefined;
  serviceName = undefined;
  status = undefined;
  orderBodyData = undefined;
  insertDate = undefined;
}

module.exports = OrderModel;
