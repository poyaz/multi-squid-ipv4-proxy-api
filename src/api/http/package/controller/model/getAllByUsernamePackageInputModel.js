/**
 * Created by pooya on 4/13/22.
 */

/**
 * Created by pooya on 8/25/21.
 */

const PackageModel = require('~src/core/model/packageModel');

class GetAllByUsernamePackageInputModel {
  /**
   *
   * @param body
   * @return {PackageModel}
   */
  getModel(body) {
    const model = new PackageModel();

    if (typeof body.type !== 'undefined') {
      model.type = body.type;
    }
    if (typeof body.country !== 'undefined') {
      model.country = body.country.toUpperCase();
    }
    if (typeof body.status !== 'undefined') {
      model.status = body.status;
    }

    return model;
  }
}

module.exports = GetAllByUsernamePackageInputModel;
