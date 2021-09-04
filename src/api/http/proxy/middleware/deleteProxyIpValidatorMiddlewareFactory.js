/**
 * Created by pooya on 8/29/21.
 */

const DeleteProxyIpValidatorMiddleware = require('./deleteProxyIpValidatorMiddleware');

class DeleteProxyIpValidatorMiddlewareFactory {
  create(req, res) {
    return new DeleteProxyIpValidatorMiddleware(req, res);
  }
}

module.exports = DeleteProxyIpValidatorMiddlewareFactory;
