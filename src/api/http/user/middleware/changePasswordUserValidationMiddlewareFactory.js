/**
 * Created by pooya on 8/29/21.
 */

const ChangePasswordUserValidationMiddleware = require('./changePasswordUserValidationMiddleware');

class ChangePasswordUserValidationMiddlewareFactory {
  create(req, res) {
    return new ChangePasswordUserValidationMiddleware(req, res);
  }
}

module.exports = ChangePasswordUserValidationMiddlewareFactory;
