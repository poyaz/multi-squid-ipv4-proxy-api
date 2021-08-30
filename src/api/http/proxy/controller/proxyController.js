/**
 * Created by pooya on 8/30/21.
 */

const GenerateProxyInputModel = require('./model/generateProxyInputModel');

class ProxyController {
  #req;
  #res;
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
   * @param req
   * @param res
   * @param {IProxyServerService} proxyServerService
   * @param {IDateTime} dateTime
   */
  constructor(req, res, proxyServerService, dateTime) {
    this.#req = req;
    this.#res = res;
    this.#proxyServerService = proxyServerService;
    this.#dateTime = dateTime;
  }

  async generateIp() {
    const { body } = this.#req;

    const generateProxyInputModel = new GenerateProxyInputModel();
    const inputModel = generateProxyInputModel.getModel(body);

    const [error, data] = await this.#proxyServerService.add(inputModel);
    if (error) {
      return [error];
    }

    return [null, { jobId: data }];
  }
}

module.exports = ProxyController;
