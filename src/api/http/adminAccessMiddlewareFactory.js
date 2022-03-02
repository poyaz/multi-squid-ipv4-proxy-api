/**
 * Created by pooya on 8/29/21.
 */

const AdminAccessMiddleware = require('./adminAccessMiddleware');

class AdminAccessMiddlewareFactory {
  create(req, res) {
    return new AdminAccessMiddleware(req, res);
  }
}

module.exports = AdminAccessMiddlewareFactory;
