/**
 * Created by pooya on 2/14/22.
 */

const IProxyServerService = require('~src/core/interface/iProxyServerService');
const { networkInterfaces } = require('os');

class FindClusterProxyServerService extends IProxyServerService {
  /**
   * @type {IProxyServerService}
   */
  #proxyServerService;
  /**
   * @type {IServerRepository}
   */
  #serverRepository;
  /**
   * @type {IServerApiRepository}
   */
  #proxyServerApiRepository;
  /**
   * @string
   */
  #currentInstanceIp;

  /**
   *
   * @param {IProxyServerService} proxyServerService
   * @param {IServerRepository} serverRepository
   * @param {IServerApiRepository} proxyServerApiRepository
   * @param {string} currentInstanceIp
   */
  constructor(proxyServerService, serverRepository, proxyServerApiRepository, currentInstanceIp) {
    super();

    this.#proxyServerService = proxyServerService;
    this.#serverRepository = serverRepository;
    this.#proxyServerApiRepository = proxyServerApiRepository;
    this.#currentInstanceIp = currentInstanceIp;
  }

  async getAll() {
    return this.#proxyServerService.getAll();
  }

  async add(model) {
    const ipMask = `${model.ip}/${model.mask}`;

    const [errorServer, dataServer] = await this.#serverRepository.getByIpAddress(ipMask);
    if (errorServer) {
      return [errorServer];
    }
    if (!dataServer) {
      return this.#proxyServerService.add(model);
    }

    if (dataServer.hostIpAddress === this.#currentInstanceIp) {
      return this.#proxyServerService.add(model);
    }

    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (dataServer.internalHostIpAddress && net.address === dataServer.internalHostIpAddress) {
          return this.#proxyServerService.add(model);
        }
      }
    }

    return this.#proxyServerApiRepository.generate(model, dataServer);
  }
}

module.exports = FindClusterProxyServerService;
