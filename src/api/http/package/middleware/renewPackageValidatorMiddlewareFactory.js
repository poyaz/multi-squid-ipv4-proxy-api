/**
 * Created by pooya on 8/29/21.
 */

const RenewPackageValidatorMiddleware = require('./renewPackageValidatorMiddleware');

class RenewPackageValidatorMiddlewareFactory {
  create(req, res) {
    return new RenewPackageValidatorMiddleware(req, res);
  }
}

module.exports = RenewPackageValidatorMiddlewareFactory;
