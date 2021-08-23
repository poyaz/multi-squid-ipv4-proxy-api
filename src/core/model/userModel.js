/**
 * Created by pooya on 8/23/21.
 */

/**
 * @property {uuid} id
 * @property {string} username
 * @property {string} password
 * @property {isEnable} boolean
 * @property {Date} insertDate
 */
class UserModel {
  id = undefined;
  username = undefined;
  password = undefined;
  isEnable = undefined;
  insertDate = undefined;
}

module.exports = UserModel;
