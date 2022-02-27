/**
 * Created by pooya on 2/14/22.
 */

const IProxyServerService = require('~src/core/interface/iProxyServerService');
const IServerService = require('~src/core/interface/iServerService');
const { networkInterfaces } = require('os');

class FindClusterProxyServerService extends IProxyServerService {
  /**
   * @type {IProxyServerService}
   */
  #proxyServerService;
  /**
   * @type {IServerService}
   */
  #serverService;
  /**
   * @type {IServerApiRepository}
   */
  #serverApiRepository;

  /**
   *
   * @param {IProxyServerService} proxyServerService
   * @param {IServerService} serverService
   * @param {IServerApiRepository} serverApiRepository
   */
  constructor(proxyServerService, serverService, serverApiRepository) {
    super();

    this.#proxyServerService = proxyServerService;
    this.#serverService = serverService;
    this.#serverApiRepository = serverApiRepository;
  }

  async getAll() {
    return this.#proxyServerService.getAll();
  }

  async add(model) {
    const ipMask = `${model.ip}/${model.mask}`;
    const [error, instanceMode, dataServer] = await this.#serverService.findInstanceExecute(ipMask);
    if (error) {
      return [error];
    }

    switch (instanceMode) {
      case IServerService.INTERNAL_SERVER_INSTANCE:
        return this.#proxyServerService.add(model);
      case IServerService.EXTERNAL_SERVER_INSTANCE:
        return this.#serverApiRepository.generateIp(model, dataServer);
    }
  }

  async reload() {
    return this.#proxyServerService.reload();
  }

  async delete(model) {
    const ipMask = `${model.ip}/${model.mask}`;
    const [error, instanceMode, dataServer] = await this.#serverService.findInstanceExecute(ipMask);
    if (error) {
      return [error];
    }

    switch (instanceMode) {
      case IServerService.INTERNAL_SERVER_INSTANCE:
        return this.#proxyServerService.delete(model);
      case IServerService.EXTERNAL_SERVER_INSTANCE:
        return this.#serverApiRepository.deleteIp(model, dataServer);
    }
  }
}

module.exports = FindClusterProxyServerService;
