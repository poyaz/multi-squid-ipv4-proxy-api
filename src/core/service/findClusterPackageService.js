/**
 * Created by pooya on 2/16/22.
 */

const IPackageService = require('~src/core/interface/iPackageService');
const SyncPackageProxyException = require('~src/core/exception/syncPackageProxyException');

class FindClusterPackageService extends IPackageService {
  /**
   * @type {IPackageService}
   */
  #packageService;
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
   * @param {IPackageService} packageService
   * @param {IServerService} serverService
   * @param {IServerApiRepository} serverApiRepository
   */
  constructor(packageService, serverService, serverApiRepository) {
    super();

    this.#packageService = packageService;
    this.#serverService = serverService;
    this.#serverApiRepository = serverApiRepository;
  }

  async getAllByUsername(username) {
    const [errorAllServer, dataAllServer] = await this.#serverService.getAll();
    if (errorAllServer) {
      return [errorAllServer];
    }

    if (dataAllServer.length === 0) {
      return this.#packageService.getAllByUsername(username);
    }

    const tasks = [];
    for (let i = 0; i < dataAllServer.length; i++) {
      const serverModel = dataAllServer[i];
      if (serverModel.isEnable) {
        tasks.push(this.#serverApiRepository.getAllPackageByUsername(username, serverModel));
      }
    }

    const resultTasks = await Promise.all(tasks);

    const dataPackageList = [];
    for (let i = 0; i < resultTasks.length; i++) {
      const [errorExecute, dataExecute] = resultTasks[i];
      if (errorExecute) {
        return [errorExecute];
      }

      for (let j = 0; j < dataExecute.length; j++) {
        const findPackageIndex = dataPackageList.findIndex((v) => v.id === dataExecute[j].id);
        if (findPackageIndex === -1) {
          dataPackageList.push(dataExecute[j]);
          continue;
        }

        for (let k = 0; k < dataExecute[j].ipList.length; k++) {
          const ipData = dataExecute[j].ipList[k];
          const findIpIndex = dataPackageList[findPackageIndex].ipList.findIndex(
            (v) => v.ip === ipData.ip && v.port === ipData.port,
          );
          if (findIpIndex === -1) {
            dataPackageList[findPackageIndex].ipList.push(ipData);
            dataPackageList[findPackageIndex].countIp++;
          }
        }
      }
    }

    return [null, dataPackageList];
  }

  async add(model) {
    const [errorAllServer, dataAllServer] = await this.#serverService.getAll();
    if (errorAllServer) {
      return [errorAllServer];
    }

    const [errorAddPackage, dataAddPackage] = await this.#packageService.add(model);
    if (errorAddPackage) {
      return [errorAddPackage];
    }

    if (dataAllServer.length === 0) {
      return [null, dataAddPackage];
    }

    const tasks = [];
    for (let i = 0; i < dataAllServer.length; i++) {
      const serverModel = dataAllServer[i];
      if (serverModel.isEnable) {
        tasks.push(this.#serverApiRepository.syncPackageById(dataAddPackage.id, serverModel));
      }
    }

    const resultTasks = await Promise.all(tasks);

    let totalError = 0;
    for (let i = 0; i < resultTasks.length; i++) {
      const [errorExecute] = resultTasks[i];
      if (errorExecute) {
        totalError++;
      }
    }

    if (totalError === resultTasks.length) {
      return [new SyncPackageProxyException()];
    }

    return [null, dataAddPackage];
  }

  async renew(id, expireDate) {
    return this.#packageService.renew(id, expireDate);
  }

  async disableExpirePackage() {
    return this.#packageService.disableExpirePackage();
  }

  async remove(id) {
    const [errorAllServer, dataAllServer] = await this.#serverService.getAll();
    if (errorAllServer) {
      return [errorAllServer];
    }

    const [errorRemovePackage, dataRemovePackage] = await this.#packageService.remove(id);
    if (errorRemovePackage) {
      return [errorRemovePackage];
    }

    if (dataAllServer.length === 0) {
      return [null, dataRemovePackage];
    }

    const tasks = [];
    for (let i = 0; i < dataAllServer.length; i++) {
      const serverModel = dataAllServer[i];
      if (serverModel.isEnable) {
        tasks.push(this.#serverApiRepository.syncPackageById(id, serverModel));
      }
    }

    const resultTasks = await Promise.all(tasks);

    for (let i = 0; i < resultTasks.length; i++) {
      const [errorExecute] = resultTasks[i];
      if (errorExecute) {
        return [new SyncPackageProxyException()];
      }
    }

    return [null];
  }

  async syncPackageById(id) {
    return this.#packageService.syncPackageById(id);
  }
}

module.exports = FindClusterPackageService;
