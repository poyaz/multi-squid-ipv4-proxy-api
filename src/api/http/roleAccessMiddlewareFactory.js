/**
 * Created by pooya on 8/29/21.
 */

const RoleAccessMiddleware = require('./roleAccessMiddleware');

class RoleAccessMiddlewareFactory {
  create(req, res, roles) {
    return new RoleAccessMiddleware(req, res, roles);
  }
}

module.exports = RoleAccessMiddlewareFactory;
