/**
 * Created by pooya on 8/23/21.
 */

const UserModel = require('~src/core/model/userModel');

class AddUserInputModel {
  /**
   *
   * @param body
   * @return {UserModel}
   */
  getModel(body) {
    const model = new UserModel();
    model.username = body.username;
    model.password = body.password;

    return model;
  }
}

module.exports = AddUserInputModel;
