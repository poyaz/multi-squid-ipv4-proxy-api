/**
 * Created by pooya on 3/2/22.
 */

const IHttpMiddleware = require('~src/api/interface/iHttpMiddleware');
const UnauthorizedException = require('~src/core/exception/unauthorizedException');
const InvalidAuthorizationHeaderException = require('~src/core/exception/invalidAuthorizationHeaderException');

class AccessMiddleware extends IHttpMiddleware {
  #req;
  #res;
  #jwt;

  constructor(req, res, jwt) {
    super();

    this.#req = req;
    this.#res = res;
    this.#jwt = jwt;
  }

  async act() {
    if (this.#req.method === 'POST' && this.#req.url.match(/^\/v[0-9]+\/user$/)) {
      return;
    }

    if (!Object.hasOwnProperty.call(this.#req.headers, 'authorization')) {
      throw new UnauthorizedException();
    }

    const authHeader = this.#req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new InvalidAuthorizationHeaderException();
    }

    try {
      this.#req.user = this.#jwt.verify(token);
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}

module.exports = AccessMiddleware;
