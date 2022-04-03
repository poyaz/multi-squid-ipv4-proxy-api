/**
 * Created by pooya on 3/2/22.
 */

const IHttpMiddleware = require('~src/api/interface/iHttpMiddleware');
const ForbiddenException = require('~src/core/exception/forbiddenException');
const UnauthorizedException = require('~src/core/exception/unauthorizedException');

class RoleAccessMiddleware extends IHttpMiddleware {
  #req;
  #res;
  /**
   * @type {Array<string>}
   */
  #roles;

  constructor(req, res, roles) {
    super();

    this.#req = req;
    this.#res = res;
    this.#roles = roles;
  }

  async act() {
    if (!Object.hasOwnProperty.call(this.#req, 'user')) {
      throw new UnauthorizedException();
    }
    if (!Object.hasOwnProperty.call(this.#req.user, 'role')) {
      throw new UnauthorizedException();
    }

    if (this.#roles.indexOf(this.#req.user.role) === -1) {
      throw new ForbiddenException();
    }

    this.#req.user.verifyAccess = true;
  }
}

module.exports = RoleAccessMiddleware;
