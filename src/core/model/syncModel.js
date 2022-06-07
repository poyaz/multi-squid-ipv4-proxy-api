/**
 * Created by pooya on 5/24/22.
 */

/**
 * @property {string} id
 * @property {string} referencesId
 * @property {string} serviceName
 * @property {string} status
 * @property {Date} insertDate
 * @property {Date} updateDate
 */
class SyncModel {
  static SERVICE_SYNC_PACKAGE = 'sync_package';
  static SERVICE_CANCEL_SUBSCRIPTION = 'cancel_subscription';
  static SERVICE_EXPIRE_PACKAGE = 'expire_package';

  static STATUS_PROCESS = 'in_process';
  static STATUS_ERROR = 'error';
  static STATUS_SUCCESS = 'success';
  static STATUS_FAIL = 'fail';

  id = undefined;
  referencesId = undefined;
  serviceName = undefined;
  status = undefined;
  insertDate = undefined;
  updateDate = undefined;

  clone() {
    return Object.assign(Object.create(this), this);
  }
}

module.exports = SyncModel;
