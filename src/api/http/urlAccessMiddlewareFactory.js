/**
 * Created by pooya on 8/29/21.
 */

const UrlAccessMiddleware = require('./urlAccessMiddleware');

class UrlAccessMiddlewareFactory {
  /**
   * @type {IAclService}
   */
  #aclService;

  /**
   *
   * @param {IAclService} aclService
   */
  constructor(aclService) {
    this.#aclService = aclService;
  }

  create(req, res) {
    return new UrlAccessMiddleware(req, res, this.#aclService);
  }
}

module.exports = UrlAccessMiddlewareFactory;
