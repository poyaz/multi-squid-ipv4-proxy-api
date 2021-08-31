/**
 * Created by pooya on 8/31/21.
 */

class BaseJobOutputModel {
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
   * @param {JobModel} model
   * @return {{}}
   */
  getOutput(model) {
    const obj = {};
    obj.id = model.id;
    obj.data = model.data;
    obj.status = model.status;
    obj.totalRecord = model.totalRecord;
    obj.totalRecordAdd = model.totalRecordAdd;
    obj.totalRecordExist = model.totalRecordExist;
    obj.totalRecordError = model.totalRecordError;
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

module.exports = BaseJobOutputModel;
