/**
 * Created by pooya on 2/12/22.
 */

const AddUserValidationMiddleware = require('./addServerValidationMiddleware');

class UpdateServerValidationMiddlewareFactory {
  create(req, res) {
    return new AddUserValidationMiddleware(req, res);
  }
}

module.exports = UpdateServerValidationMiddlewareFactory;
