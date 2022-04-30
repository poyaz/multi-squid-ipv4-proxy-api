/**
 * Created by pooya on 4/30/22.
 */

const AddOrderValidationMiddleware = require('./addOrderValidationMiddleware');

class AddOrderValidationMiddlewareFactory {
  create(req, res) {
    return new AddOrderValidationMiddleware(req, res);
  }
}

module.exports = AddOrderValidationMiddlewareFactory;
