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

  async getUserById(userId) {
    return this.#userService.getUserById(userId);
  }

  async checkUsernameAndPassword(username, password) {
    return this.#userService.checkUsernameAndPassword(username, password);
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

  async addAdmin(model) {
    const [errorAllServer, dataAllServer] = await this.#serverService.getAll();
    if (errorAllServer) {
      return [errorAllServer];
    }

    const [errorAddUser, dataAddUser] = await this.#userService.addAdmin(model);
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

  async changePassword(username, password) {
    const [errorAllServer, dataAllServer] = await this.#serverService.getAll();
    if (errorAllServer) {
      return [errorAllServer];
    }

    const [errorChangePassword] = await this.#userService.changePassword(username, password);
    if (errorChangePassword) {
      return [errorChangePassword];
    }

    if (dataAllServer.length === 0) {
      return [null];
    }

    const tasks = [];
    for (let i = 0; i < dataAllServer.length; i++) {
      const serverModel = dataAllServer[i];
      if (serverModel.isEnable && serverModel.hostIpAddress !== this.#currentInstanceIp) {
        tasks.push(this.#serverApiRepository.changeUserPassword(username, password, serverModel));
      }
    }

    const resultTasks = await Promise.all(tasks);

    for (let i = 0; i < resultTasks.length; i++) {
      const [errorExecute] = resultTasks[i];
      if (errorExecute) {
        return [errorExecute];
      }
    }

    return [null];
  }

  async disableByUsername(username) {
    const [errorAllServer, dataAllServer] = await this.#serverService.getAll();
    if (errorAllServer) {
      return [errorAllServer];
    }

    const [errorDisableUser] = await this.#userService.disableByUsername(username);
    if (errorDisableUser) {
      return [errorDisableUser];
    }

    if (dataAllServer.length === 0) {
      return [null];
    }

    const tasks = [];
    for (let i = 0; i < dataAllServer.length; i++) {
      const serverModel = dataAllServer[i];
      if (serverModel.isEnable && serverModel.hostIpAddress !== this.#currentInstanceIp) {
        tasks.push(this.#serverApiRepository.changeUserStatus(username, false, serverModel));
      }
    }

    const resultTasks = await Promise.all(tasks);

    for (let i = 0; i < resultTasks.length; i++) {
      const [errorExecute] = resultTasks[i];
      if (errorExecute) {
        return [errorExecute];
      }
    }

    return [null];
  }

  async enableByUsername(username) {
    const [errorAllServer, dataAllServer] = await this.#serverService.getAll();
    if (errorAllServer) {
      return [errorAllServer];
    }

    const [errorEnableUser] = await this.#userService.enableByUsername(username);
    if (errorEnableUser) {
      return [errorEnableUser];
    }

    if (dataAllServer.length === 0) {
      return [null];
    }

    const tasks = [];
    for (let i = 0; i < dataAllServer.length; i++) {
      const serverModel = dataAllServer[i];
      if (serverModel.isEnable && serverModel.hostIpAddress !== this.#currentInstanceIp) {
        tasks.push(this.#serverApiRepository.changeUserStatus(username, true, serverModel));
      }
    }

    const resultTasks = await Promise.all(tasks);

    for (let i = 0; i < resultTasks.length; i++) {
      const [errorExecute] = resultTasks[i];
      if (errorExecute) {
        return [errorExecute];
      }
    }

    return [null];
  }

  async update(model) {
    return this.#userService.update(model);
  }
}

module.exports = FindClusterUserService;
