/**
 * Created by pooya on 8/29/21.
 */

const UserAccessMiddleware = require('./userAccessMiddleware');

class UserAccessMiddlewareFactory {
  create(req, res) {
    return new UserAccessMiddleware(req, res);
  }
}

module.exports = UserAccessMiddlewareFactory;
