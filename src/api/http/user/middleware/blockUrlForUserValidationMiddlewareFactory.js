/**
 * Created by pooya on 8/29/21.
 */

const BlockUrlForUserValidationMiddleware = require('./blockUrlForUserValidationMiddleware');

class BlockUrlForUserValidationMiddlewareFactory {
  create(req, res) {
    return new BlockUrlForUserValidationMiddleware(req, res);
  }
}

module.exports = BlockUrlForUserValidationMiddlewareFactory;
