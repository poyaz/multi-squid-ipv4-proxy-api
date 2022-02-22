/**
 * Created by pooya on 2/21/22.
 */

const IUserService = require('~src/core/interface/iUserService');

class FindClusterUserService extends IUserService {
  /**
   * @type {IUserService}
   */
  #userService;
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
   * @param {IUserService} userService
   * @param {IServerService} serverService
   * @param {IServerApiRepository} serverApiRepository
   * @param {string} currentInstanceIp
   */
  constructor(userService, serverService, serverApiRepository, currentInstanceIp) {
    super();

    this.#userService = userService;
    this.#serverService = serverService;
    this.#serverApiRepository = serverApiRepository;
    this.#currentInstanceIp = currentInstanceIp;
  }

  async getAll(filterModel) {
    return this.#userService.getAll(filterModel);
  }

  async add(model) {
    const [errorAllServer, dataAllServer] = await this.#serverService.getAll();
    if (errorAllServer) {
      return [errorAllServer];
    }

    const [errorAddUser, dataAddUser] = await this.#userService.add(model);
    if (errorAddUser) {
      return [errorAddUser];
    }

    if (dataAllServer.length === 0) {
      return [null, dataAddUser];
    }

    const tasks = [];
    for (let i = 0; i < dataAllServer.length; i++) {
      const serverModel = dataAllServer[i];
      if (serverModel.isEnable && serverModel.hostIpAddress !== this.#currentInstanceIp) {
        tasks.push(this.#serverApiRepository.addUser(model, serverModel));
      }
    }

    const resultTasks = await Promise.all(tasks);

    for (let i = 0; i < resultTasks.length; i++) {
      const [errorExecute] = resultTasks[i];
      if (errorExecute) {
        return [errorExecute];
      }
    }

    return [null, dataAddUser];
  }
}

module.exports = FindClusterUserService;
