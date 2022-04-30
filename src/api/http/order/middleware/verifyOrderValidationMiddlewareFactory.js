/**
 * Created by pooya on 4/30/22.
 */

const VerifyOrderValidationMiddleware = require('./verifyOrderValidationMiddleware');

class VerifyOrderValidationMiddlewareFactory {
  create(req, res) {
    return new VerifyOrderValidationMiddleware(req, res);
  }
}

module.exports = VerifyOrderValidationMiddlewareFactory;
