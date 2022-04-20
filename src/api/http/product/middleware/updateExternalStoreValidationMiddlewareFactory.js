/**
 * Created by pooya on 4/17/22.
 */

const UpdateExternalStoreValidationMiddleware = require('./updateExternalStoreValidationMiddleware');

class UpdateExternalStoreValidationMiddlewareFactory {
  create(req, res) {
    return new UpdateExternalStoreValidationMiddleware(req, res);
  }
}

module.exports = UpdateExternalStoreValidationMiddlewareFactory;
