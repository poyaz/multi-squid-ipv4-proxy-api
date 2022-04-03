/**
 * Created by pooya on 3/2/22.
 */

const IHttpMiddleware = require('~src/api/interface/iHttpMiddleware');
const ForbiddenException = require('~src/core/exception/forbiddenException');
const UnauthorizedException = require('~src/core/exception/unauthorizedException');

class SelfUserAccessMiddleware extends IHttpMiddleware {
  #req;
  #res;
  /**
   * @type {Array<string>}
   */
  #allowAccess;

  constructor(req, res, allowAccess) {
    super();

    this.#req = req;
    this.#res = res;
    this.#allowAccess = allowAccess;
  }

  async act() {
    if (this.#allowAccess.indexOf(this.#req.user.role) !== -1) {
      return;
    }

    if (this.#req.user.id !== this.#req.params.userId) {
      throw new ForbiddenException();
    }
  }
}

module.exports = SelfUserAccessMiddleware;
