/**
 * Created by pooya on 8/29/21.
 */

const InitProxyValidatorMiddleware = require('./initProxyValidatorMiddleware');

class InitProxyValidatorMiddlewareFactory {
  create(req, res) {
    return new InitProxyValidatorMiddleware(req, res);
  }
}

module.exports = InitProxyValidatorMiddlewareFactory;
