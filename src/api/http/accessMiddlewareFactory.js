/**
 * Created by pooya on 8/29/21.
 */

const AccessMiddleware = require('./accessMiddleware');

class AccessMiddlewareFactory {
  #jwt;

  constructor(jwt) {
    this.#jwt = jwt;
  }

  create(req, res) {
    return new AccessMiddleware(req, res, this.#jwt);
  }
}

module.exports = AccessMiddlewareFactory;
