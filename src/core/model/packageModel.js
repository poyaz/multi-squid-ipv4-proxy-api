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
 * @property {boolean} isEnable
 * @property {Date} insertDate
 * @property {Date} updateDate
 * @property {Date} deleteDate
 * @property {Date} expireDate
 */
class PackageModel {
  id = undefined;
  userId = undefined;
  username = undefined;
  password = undefined;
  countIp = undefined;
  type = undefined;
  country = undefined;
  ipList = [];
  isEnable = undefined;
  insertDate = undefined;
  updateDate = undefined;
  deleteDate = undefined;
  expireDate = undefined;
}

module.exports = PackageModel;
