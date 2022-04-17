/**
 * Created by pooya on 4/17/22.
 */

const UpdateProductValidationMiddleware = require('./updateProductValidationMiddleware');

class UpdateProductValidationMiddlewareFactory {
  create(req, res) {
    return new UpdateProductValidationMiddleware(req, res);
  }
}

module.exports = UpdateProductValidationMiddlewareFactory;
