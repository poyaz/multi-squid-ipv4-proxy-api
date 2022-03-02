/**
 * Created by pooya on 3/2/22.
 */

const IHttpMiddleware = require('~src/api/interface/iHttpMiddleware');
const ForbiddenException = require('~src/core/exception/forbiddenException');
const UnauthorizedException = require('~src/core/exception/unauthorizedException');

class AdminAccessMiddleware extends IHttpMiddleware {
  #req;
  #res;

  constructor(req, res) {
    super();

    this.#req = req;
    this.#res = res;
  }

  async act() {
    if (!Object.hasOwnProperty.call(this.#req, 'user')) {
      throw new UnauthorizedException();
    }
    if (!Object.hasOwnProperty.call(this.#req.user, 'role')) {
      throw new UnauthorizedException();
    }

    if (this.#req.user.verifyAccess) {
      return;
    }

    if (this.#req.user.role !== 'admin') {
      throw new ForbiddenException();
    }

    this.#req.user.verifyAccess = true;
  }
}

module.exports = AdminAccessMiddleware;
