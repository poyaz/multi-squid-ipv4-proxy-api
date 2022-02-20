/**
 * Created by pooya on 8/25/21.
 */

const UserModel = require('~src/core/model/userModel');
const PackageModel = require('~src/core/model/packageModel');
const IPackageService = require('~src/core/interface/iPackageService');
const NotFoundException = require('~src/core/exception/notFoundException');
const ExpireDateException = require('~src/core/exception/expireDateException');
const DisableUserException = require('~src/core/exception/disableUserException');

class PackageService extends IPackageService {
  /**
   * @type {IUserService}
   */
  #userService;
  /**
   * @type {IPackageRepository}
   */
  #packageRepository;
  /**
   * @type {IPackageRepository}
   */
  #packageFileRepository;
  /**
   * @type {IProxyServerRepository}
   */
  #proxySquidRepository;

  /**
   *
   * @param {IUserService} userService
   * @param {IPackageRepository} packageRepository
   * @param {IPackageRepository} packageFileRepository
   * @param {IProxyServerRepository} proxySquidRepository
   */
  constructor(userService, packageRepository, packageFileRepository, proxySquidRepository) {
    super();

    this.#userService = userService;
    this.#packageRepository = packageRepository;
    this.#packageFileRepository = packageFileRepository;
    this.#proxySquidRepository = proxySquidRepository;
  }

  async getAllByUsername(username) {
    const [existError] = await this._getUserModelByUsername(username);
    if (existError) {
      return [existError];
    }

    const [fetchError, fetchData] = await this.#packageRepository.getAllByUsername(username);
    if (fetchError) {
      return [fetchError];
    }

    const [fetchFileError, fetchFileData] = await this.#packageFileRepository.getAllByUsername(
      username,
    );
    if (fetchFileError) {
      return [fetchFileError];
    }

    if (fetchFileData.length === 0) {
      return [null, []];
    }

    const validRunningIpList = fetchFileData[0].ipList;
    for (let i = 0; i < fetchData.length; i++) {
      const data = fetchData[i];
      if (data.expireDate.getTime() < new Date().getTime()) {
        continue;
      }

      const validMatchIpList = data.ipList.filter((source) =>
        validRunningIpList.find((find) => source.ip === find.ip),
      );

      data.countIp = validMatchIpList.length;
      data.ipList = validMatchIpList;
    }

    return [null, fetchData];
  }

  async add(model) {
    const [fetchError, fetchData] = await this._getUserModelByUsername(model.username);
    if (fetchError) {
      return [fetchError];
    }
    if (!fetchData.isEnable) {
      return [new DisableUserException()];
    }

    model.userId = fetchData.id;
    const [addError, addData] = await this.#packageRepository.add(model);
    if (addError) {
      return [addError];
    }

    const [addFileError] = await this.#packageFileRepository.add(addData);
    if (addFileError) {
      return [addFileError];
    }

    this._reloadServer();

    return [null, addData];
  }

  async renew(id, expireDate) {
    const [fetchError, fetchData] = await this.#packageRepository.getById(id);
    if (fetchError) {
      return [fetchError];
    }
    if (!fetchData) {
      return [new NotFoundException()];
    }
    if (fetchData.expireDate.getTime() <= new Date().getTime()) {
      return [new ExpireDateException()];
    }

    const updateModel = new PackageModel();
    updateModel.id = id;
    updateModel.expireDate = expireDate;

    const [updateError] = await this.#packageRepository.update(updateModel);
    if (updateError) {
      return [updateError];
    }

    return [null];
  }

  async disableExpirePackage() {
    const [
      expirePackageError,
      expirePackageList,
    ] = await this.#packageRepository.getAllExpirePackage();
    if (expirePackageError) {
      return [expirePackageError];
    }

    if (expirePackageList.length === 0) {
      return [null];
    }

    let totalSuccessfulExpireCount = 0;
    for await (const expirePackage of expirePackageList) {
      const [updateError] = await this.#packageFileRepository.update(expirePackage);
      if (updateError) {
        console.error('updateDisablePackage', updateError);
        continue;
      }

      totalSuccessfulExpireCount++;
    }

    if (totalSuccessfulExpireCount > 0) {
      this._reloadServer();
    }

    return [null];
  }

  async remove(id) {
    const [packageError, packageData] = await this.#packageRepository.getById(id);
    if (packageError) {
      return [packageError];
    }
    if (!packageData) {
      return [new NotFoundException()];
    }

    const [removeProxyError] = await this.#packageFileRepository.update(packageData);
    if (removeProxyError) {
      return [removeProxyError];
    }

    packageData.deleteDate = new Date();
    const [removePackageError] = await this.#packageRepository.update(packageData);
    if (removePackageError) {
      return [removePackageError];
    }

    this._reloadServer();

    return [null];
  }

  async _getUserModelByUsername(username) {
    const filterModel = new UserModel();
    filterModel.username = username;

    const [fetchError, fetchData] = await this.#userService.getAll(filterModel);
    if (fetchError) {
      return [fetchError];
    }
    if (fetchData.length === 0) {
      return [new NotFoundException()];
    }

    return [null, fetchData[0]];
  }

  _reloadServer() {
    (async () => {
      const [error] = await this.#proxySquidRepository.reload();
      if (error) {
        console.error(error);
      }
    })().catch(console.error);
  }
}

module.exports = PackageService;
