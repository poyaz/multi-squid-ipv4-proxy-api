/**
 * Created by pooya on 8/23/21.
 */

class LoginUserOutputModel {
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
    const data = { id: model.id, role: 'user' };

    const obj = {};
    obj.token = this.#jwt.sign(data);

    return obj;
  }
}

module.exports = LoginUserOutputModel;
