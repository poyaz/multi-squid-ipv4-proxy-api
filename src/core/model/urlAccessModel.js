/**
 * Created by pooya on 8/26/21.
 */

/**
 * @property {uuid} id
 * @property {uuid} userId
 * @property {string} username
 * @property {Array<{url: string, isBlock: boolean}>} urlList
 * @property {Date} startDate
 * @property {Date} endDate
 * @property {Date} insertDate
 * @property {Date} updateDate
 */
class UrlAccessModel {
  id = undefined;
  userId = undefined;
  username = undefined;
  urlList = [];
  startDate = undefined;
  endDate = undefined;
  insertDate = undefined;
  updateDate = undefined;

  clone() {
    return Object.assign(Object.create(this), this);
  }
}

module.exports = UrlAccessModel;
