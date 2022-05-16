/**
 * Created by pooya on 3/2/22.
 */

const IHttpMiddleware = require('~src/api/interface/iHttpMiddleware');

class UrlAccessMiddleware extends IHttpMiddleware {
  #req;
  #res;
  /**
   * @type {IAclService}
   */
  #aclService;

  constructor(req, res, aclService) {
    super();

    this.#req = req;
    this.#res = res;
    this.#aclService = aclService;
  }

  async act() {
    if (this.#req.user.role === 'admin') {
      return;
    }
    
    const [error] = await this.#aclService.isAccessToUrl(this.#req.user, this.#req.params);
    if (error) {
      throw error;
    }
  }
}

module.exports = UrlAccessMiddleware;
