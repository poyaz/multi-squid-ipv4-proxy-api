/**
 * Created by pooya on 8/23/21.
 */

class BaseUserOutputModel {
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
   * @param {UserModel} model
   * @return {{}}
   */
  getOutput(model) {
    const obj = {};
    obj.id = model.id;
    obj.username = model.username;
    obj.role = model.role;
    obj.insertDate = this._gregorianWithTimezoneString(model.insertDate);

    const discordId = model.externalOauthData.discordId;
    if (discordId) {
      obj.discordUser = `${model.username}#${discordId}`;
    }

    return obj;
  }

  _gregorianWithTimezoneString(date) {
    if (!date) {
      return null;
    }

    return this.#dateTime.gregorianWithTimezoneString(date);
  }
}

module.exports = BaseUserOutputModel;
