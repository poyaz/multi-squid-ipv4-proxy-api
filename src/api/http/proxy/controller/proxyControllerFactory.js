/**
 * Created by pooya on 8/30/21.
 */

const ProxyController = require('./proxyController');

class ProxyControllerFactory {
  /**
   * @type {IProxyServerService}
   */
  #ProxyServerService;
  /**
   * @type {IDateTime}
   */
  #dateTime;

  /**
   *
   * @param {IProxyServerService} ProxyServerService
   * @param {IDateTime} dateTime
   */
  constructor(ProxyServerService, dateTime) {
    this.#ProxyServerService = ProxyServerService;
    this.#dateTime = dateTime;
  }

  /**
   *
   * @param req
   * @param res
   * @return {ProxyController}
   */
  create(req, res) {
    return new ProxyController(req, res, this.#ProxyServerService, this.#dateTime);
  }
}

module.exports = ProxyControllerFactory;
