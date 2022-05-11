/**
 * Created by pooya on 8/25/21.
 */

/**
 * @property {uuid} id
 * @property {uuid} userId
 * @property {string} username
 * @property {string} password
 * @property {number} countIp
 * @property {string} type
 * @property {string} country
 * @property {Array<{ip: string, port: number}>} ipList
 * @property {string} status
 * @property {Date} insertDate
 * @property {Date} updateDate
 * @property {Date} deleteDate
 * @property {Date} expireDate
 * @property {Date} renewalDate
 */
class PackageModel {
  static STATUS_ENABLE = 'enable';
  static STATUS_DISABLE = 'disable';
  static STATUS_EXPIRE = 'expire';
  static STATUS_CANCEL = 'cancel';
  static STATUS_DELETE = 'delete';

  id = undefined;
  userId = undefined;
  username = undefined;
  password = undefined;
  countIp = undefined;
  type = undefined;
  country = undefined;
  ipList = [];
  status = undefined;
  insertDate = undefined;
  updateDate = undefined;
  deleteDate = undefined;
  expireDate = undefined;
  renewalDate = undefined;
}

module.exports = PackageModel;
