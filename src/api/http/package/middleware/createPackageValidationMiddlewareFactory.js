/**
 * Created by pooya on 8/23/21.
 */

const CreatePackageValidationMiddleware = require('./createPackageValidationMiddleware');

class CreatePackageValidationMiddlewareFactory {
  create(req, res) {
    return new CreatePackageValidationMiddleware(req, res);
  }
}

module.exports = CreatePackageValidationMiddlewareFactory;
