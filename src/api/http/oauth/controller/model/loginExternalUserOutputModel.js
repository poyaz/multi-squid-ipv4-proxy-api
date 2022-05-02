/**
 * Created by pooya on 8/23/21.
 */

class LoginExternalUserOutputModel {
  #jwt;

  /**
   *
   * @param jwt
   */
  constructor(jwt) {
    this.#jwt = jwt;
  }

  /**
   *
   * @param {UserModel} model
   * @return {{}}
   */
  getOutput(model) {
    const data = { id: model.id, username: model.username, role: model.role, type: 'external' };

    const discordId = model.externalOauthData.discordId;
    if (discordId) {
      data.discordUser = `${model.username}#${discordId}`;
    }

    const obj = {};
    obj.token = this.#jwt.sign(data);

    return obj;
  }
}

module.exports = LoginExternalUserOutputModel;
