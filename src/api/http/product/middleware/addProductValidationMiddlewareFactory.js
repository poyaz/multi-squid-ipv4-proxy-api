/**
 * Created by pooya on 4/17/22.
 */

const AddProductValidationMiddleware = require('./addProductValidationMiddleware');

class AddProductValidationMiddlewareFactory {
  create(req, res) {
    return new AddProductValidationMiddleware(req, res);
  }
}

module.exports = AddProductValidationMiddlewareFactory;
