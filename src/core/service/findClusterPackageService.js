/**
 * Created by pooya on 2/16/22.
 */

const IPackageService = require('~src/core/interface/iPackageService');

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
}

module.exports = FindClusterPackageService;
