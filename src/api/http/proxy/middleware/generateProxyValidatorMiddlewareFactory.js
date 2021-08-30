/**
 * Created by pooya on 8/29/21.
 */

const GenerateProxyValidatorMiddleware = require('./generateProxyValidatorMiddleware');

class GenerateProxyValidatorMiddlewareFactory {
  create(req, res) {
    return new GenerateProxyValidatorMiddleware(req, res);
  }
}

module.exports = GenerateProxyValidatorMiddlewareFactory;
