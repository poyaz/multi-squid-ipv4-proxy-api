/**
 * Created by pooya on 8/25/21.
 */

/**
 * @property {uuid} id
 * @property {uuid} userId
 * @property {string} username
 * @property {number} countIp
 * @property {Array<{ip: string, port: number}>} ipList
 * @property {Date} insertDate
 * @property {Date} updateDate
 * @property {Date} deleteDate
 * @property {Date} expireDate
 */
class PackageModel {
  id = undefined;
  userId = undefined;
  username = undefined;
  countIp = undefined;
  ipList = [];
  insertDate = undefined;
  updateDate = undefined;
  deleteDate = undefined;
  expireDate = undefined;
}

module.exports = PackageModel;
