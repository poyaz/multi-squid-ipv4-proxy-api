/**
 * Created by pooya on 8/25/21.
 */

const yn = require('yn');
const UserModel = require('~src/core/model/userModel');

class GetAllUserInputModel {
  /**
   *
   * @param body
   * @return {UserModel}
   */
  getModel(body) {
    const model = new UserModel();

    if (typeof body.username !== 'undefined') {
      model.username = body.username;
    }
    if (typeof body.isEnable !== 'undefined') {
      model.isEnable = yn(body.isEnable);
    }

    return model;
  }
}

module.exports = GetAllUserInputModel;
