/**
 * Created by pooya on 8/30/21.
 */

class JobModel {
  static STATUS_PENDING = 'pending';
  static STATUS_PROCESSING = 'processing';
  static STATUS_SUCCESS = 'success';
  static STATUS_FAIL = 'fail';

  id = undefined;
  data = undefined;
  status = undefined;
  totalRecord = undefined;
  totalRecordAdd = undefined;
  totalRecordExist = undefined;
  totalRecordError = undefined;
  insertDate = undefined;

  clone() {
    return Object.assign(Object.create(this), this);
  }
}

module.exports = JobModel;
