/**
 * Created by pooya on 4/17/22.
 */

const AddExternalStoreValidationMiddleware = require('./addExternalStoreValidationMiddleware');

class AddExternalStoreValidationMiddlewareFactory {
  create(req, res) {
    return new AddExternalStoreValidationMiddleware(req, res);
  }
}

module.exports = AddExternalStoreValidationMiddlewareFactory;
