/**
 * Created by pooya on 2/13/22.
 */

const { networkInterfaces } = require('os');
const IServerService = require('~src/core/interface/iServerService');
const NotFoundException = require('~src/core/exception/notFoundException');

class ServerService extends IServerService {
  /**
   * @type {IServerRepository}
   */
  #serverRepository;
  /**
   * @type {string}
   */
  #currentInstanceIp;

  /**
   *
   * @param {IServerRepository} serverRepository
   * @param {string} currentInstanceIp
   */
  constructor(serverRepository, currentInstanceIp) {
    super();

    this.#serverRepository = serverRepository;
    this.#currentInstanceIp = currentInstanceIp;
  }

  async getAll() {
    return this.#serverRepository.getAll();
  }

  async findInstanceExecute(ipMask) {
    const [errorServer, dataServer] = await this.#serverRepository.getByIpAddress(ipMask);
    if (errorServer) {
      return [errorServer];
    }

    if (!dataServer) {
      return [null, IServerService.INTERNAL_SERVER_INSTANCE];
    }

    if (dataServer.hostIpAddress === this.#currentInstanceIp) {
      return [null, IServerService.INTERNAL_SERVER_INSTANCE, dataServer];
    }

    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (dataServer.internalHostIpAddress && net.address === dataServer.internalHostIpAddress) {
          return [null, IServerService.INTERNAL_SERVER_INSTANCE, dataServer];
        }
      }
    }

    return [null, IServerService.EXTERNAL_SERVER_INSTANCE, dataServer];
  }

  async add(model) {
    return this.#serverRepository.add(model);
  }

  async update(model) {
    const [errorCheck, dataCheck] = await this.#serverRepository.getById(model.id);
    if (errorCheck) {
      return [errorCheck];
    }
    if (!dataCheck) {
      return [new NotFoundException()];
    }

    return this.#serverRepository.update(model);
  }

  async delete(id) {
    const [errorCheck, dataCheck] = await this.#serverRepository.getById(id);
    if (errorCheck) {
      return [errorCheck];
    }
    if (!dataCheck) {
      return [new NotFoundException()];
    }

    return this.#serverRepository.delete(id);
  }
}

module.exports = ServerService;
