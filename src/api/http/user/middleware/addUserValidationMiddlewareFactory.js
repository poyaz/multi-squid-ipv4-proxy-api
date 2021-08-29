/**
 * Created by pooya on 8/29/21.
 */

const AddUserValidationMiddleware = require('./addUserValidationMiddleware');

class AddUserValidationMiddlewareFactory {
  create(req, res) {
    return new AddUserValidationMiddleware(req, res);
  }
}

module.exports = AddUserValidationMiddlewareFactory;
