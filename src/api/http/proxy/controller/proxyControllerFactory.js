/**
 * Created by pooya on 8/30/21.
 */

const ProxyController = require('./proxyController');

class ProxyControllerFactory {
  /**
   * @type {IProxyServerService}
   */
  #proxyServerService;
  /**
   * @type {IDateTime}
   */
  #dateTime;

  /**
   *
   * @param {IProxyServerService} proxyServerService
   * @param {IDateTime} dateTime
   */
  constructor(proxyServerService, dateTime) {
    this.#proxyServerService = proxyServerService;
    this.#dateTime = dateTime;
  }

  /**
   *
   * @param req
   * @param res
   * @return {ProxyController}
   */
  create(req, res) {
    return new ProxyController(req, res, this.#proxyServerService, this.#dateTime);
  }
}

module.exports = ProxyControllerFactory;
