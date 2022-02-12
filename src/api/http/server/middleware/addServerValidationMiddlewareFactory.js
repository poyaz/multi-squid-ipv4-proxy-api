/**
 * Created by pooya on 2/12/22.
 */

const AddUserValidationMiddleware = require('./addServerValidationMiddleware');

class AddServerValidationMiddlewareFactory {
  create(req, res) {
    return new AddUserValidationMiddleware(req, res);
  }
}

module.exports = AddServerValidationMiddlewareFactory;
