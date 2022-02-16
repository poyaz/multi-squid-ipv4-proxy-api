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

  static INTERNAL_SERVER_INSTANCE = 'internal';
  static EXTERNAL_SERVER_INSTANCE = 'external';

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
    const [error, instanceMode, dataServer] = await this._findServerInstance(ipMask);
    if (error) {
      return [error];
    }

    switch (instanceMode) {
      case FindClusterProxyServerService.INTERNAL_SERVER_INSTANCE:
        return this.#proxyServerService.add(model);
      case FindClusterProxyServerService.EXTERNAL_SERVER_INSTANCE:
        return this.#proxyServerApiRepository.generateIp(model, dataServer);
    }
  }

  async reload() {
    return this.#proxyServerService.reload();
  }

  async delete(model) {
    const ipMask = `${model.ip}/${model.mask}`;
    const [error, instanceMode, dataServer] = await this._findServerInstance(ipMask);
    if (error) {
      return [error];
    }

    switch (instanceMode) {
      case FindClusterProxyServerService.INTERNAL_SERVER_INSTANCE:
        return this.#proxyServerService.delete(model);
      case FindClusterProxyServerService.EXTERNAL_SERVER_INSTANCE:
        return this.#proxyServerApiRepository.deleteIp(model, dataServer);
    }
  }

  async _findServerInstance(ipMask) {
    const [errorServer, dataServer] = await this.#serverRepository.getByIpAddress(ipMask);
    if (errorServer) {
      return [errorServer];
    }
    if (!dataServer) {
      return [null, FindClusterProxyServerService.INTERNAL_SERVER_INSTANCE, dataServer];
    }

    if (dataServer.hostIpAddress === this.#currentInstanceIp) {
      return [null, FindClusterProxyServerService.INTERNAL_SERVER_INSTANCE, dataServer];
    }

    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (dataServer.internalHostIpAddress && net.address === dataServer.internalHostIpAddress) {
          return [null, FindClusterProxyServerService.INTERNAL_SERVER_INSTANCE, dataServer];
        }
      }
    }

    return [null, FindClusterProxyServerService.EXTERNAL_SERVER_INSTANCE, dataServer];
  }
}

module.exports = FindClusterProxyServerService;
