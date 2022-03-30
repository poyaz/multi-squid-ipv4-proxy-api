/**
 * Created by pooya on 3/29/22.
 */

const IServerService = require('~src/core/interface/iServerService');

class FindClusterServerService extends IServerService {
  /**
   * @type {IServerService}
   */
  #serverService;
  /**
   * @type {IServerApiRepository}
   */
  #serverApiRepository;
  /**
   * @type {string}
   */
  #currentInstanceIp;

  /**
   *
   * @param {IServerService} serverService
   * @param {IServerApiRepository} serverApiRepository
   * @param {string} currentInstanceIp
   */
  constructor(serverService, serverApiRepository, currentInstanceIp) {
    super();

    this.#serverService = serverService;
    this.#serverApiRepository = serverApiRepository;
    this.#currentInstanceIp = currentInstanceIp;
  }

  async getAll() {
    return this.#serverService.getAll();
  }

  async getAllInterface() {
    const [errorAllServer, dataAllServer] = await this.#serverService.getAll();
    if (errorAllServer) {
      return [errorAllServer];
    }

    const [, dataInterface] = await this.#serverService.getAllInterface();

    if (dataAllServer.length === 0) {
      return [null, dataInterface];
    }

    const tasks = [];
    for (let i = 0; i < dataAllServer.length; i++) {
      const serverModel = dataAllServer[i];
      if (serverModel.isEnable && serverModel.hostIpAddress !== this.#currentInstanceIp) {
        tasks.push(this.#serverApiRepository.getAllInterfaceOfServer(serverModel));
      }
    }

    const resultTasks = await Promise.all(tasks);

    for (let i = 0; i < resultTasks.length; i++) {
      const [errorExecute, dataExecute] = resultTasks[i];
      if (errorExecute) {
        return [errorExecute];
      }

      dataInterface.push(...dataExecute);
    }

    const result = dataInterface.filter(
      (s, index) =>
        dataInterface.findIndex(
          (d) => s.hostname === d.hostname && s.interfaceName === d.interfaceName,
        ) === index,
    );

    return [null, result];
  }

  async findInstanceExecute(ipMask) {
    return this.#serverService.findInstanceExecute(ipMask);
  }

  async add(model) {
    return this.#serverService.add(model);
  }

  async update(model) {
    return this.#serverService.update(model);
  }

  async delete(id) {
    return this.#serverService.delete(id);
  }
}

module.exports = FindClusterServerService;
