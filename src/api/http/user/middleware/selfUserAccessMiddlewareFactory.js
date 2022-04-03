/**
 * Created by pooya on 8/29/21.
 */

const SelfUserAccessMiddleware = require('./selfUserAccessMiddleware');

class SelfUserAccessMiddlewareFactory {
  create(req, res, allowAccess) {
    return new SelfUserAccessMiddleware(req, res, allowAccess);
  }
}

module.exports = SelfUserAccessMiddlewareFactory;
