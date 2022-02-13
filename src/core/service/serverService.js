/**
 * Created by pooya on 2/13/22.
 */

const IServerService = require('~src/core/interface/iServerService');
const NotFoundException = require('~src/core/exception/notFoundException');

class ServerService extends IServerService {
  /**
   * @type {IServerRepository}
   */
  #serverRepository;

  /**
   *
   * @param {IServerRepository} serverRepository
   */
  constructor(serverRepository) {
    super();

    this.#serverRepository = serverRepository;
  }

  async getAll() {
    return this.#serverRepository.getAll();
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
