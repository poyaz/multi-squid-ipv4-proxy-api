/**
 * Created by pooya on 3/13/22.
 */

class GetOptionsOutputModel {
  /**
   *
   * @param {Array<OauthModel>} models
   * @return {Object}
   */
  getOutput(models) {
    return models.map((v) => {
      const obj = {};

      obj.id = v.id;
      obj.platform = v.platform;
      obj.redirectUrl = v.redirectUrl;

      return obj;
    });
  }
}

module.exports = GetOptionsOutputModel;
