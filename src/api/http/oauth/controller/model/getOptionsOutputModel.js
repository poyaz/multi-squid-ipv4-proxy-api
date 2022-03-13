/**
 * Created by pooya on 3/13/22.
 */

class GetOptionsOutputModel {
  /**
   *
   * @param {OauthModel} model
   * @return {Object}
   */
  getOutput(model) {
    const obj = {};

    obj.id = model.id;
    obj.platform = model.platform;
    obj.redirectUrl = model.redirectUrl;

    return obj;
  }
}

module.exports = GetOptionsOutputModel;
