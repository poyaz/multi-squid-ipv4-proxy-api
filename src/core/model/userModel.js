/**
 * Created by pooya on 8/23/21.
 */

/**
 * @property {uuid} id
 * @property {string} username
 * @property {string} password
 * @property {Object<{discordId: string}>} externalOauthData
 * @property {isEnable} boolean
 * @property {Date} insertDate
 */
class UserModel {
  id = undefined;
  username = undefined;
  password = undefined;
  externalOauthData = {};
  isEnable = undefined;
  insertDate = undefined;

  clone() {
    return Object.assign(Object.create(this), this);
  }
}

module.exports = UserModel;
