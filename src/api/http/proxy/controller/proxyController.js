/**
 * Created by pooya on 8/30/21.
 */

const GenerateProxyInputModel = require('./model/generateProxyInputModel');
const GetAllProxyIpOutputModel = require('./model/getAllProxyIpOutputModel');

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

  async getAll() {
    const [error, data] = await this.#proxyServerService.getAll();
    if (error) {
      return [error];
    }

    const getAllProxyIpOutputModel = new GetAllProxyIpOutputModel(this.#dateTime);
    const result = getAllProxyIpOutputModel.getOutput(data);

    return [null, result];
  }

  async generateIp() {
    const { body } = this.#req;

    const generateProxyInputModel = new GenerateProxyInputModel();
    const inputModel = generateProxyInputModel.getModel(body);

    const [error, data] = await this.#proxyServerService.add(inputModel);
    if (error) {
      return [error];
    }

    return [null, { jobId: data.id }];
  }

  async reload() {
    return this.#proxyServerService.reload();
  }
}

module.exports = ProxyController;
