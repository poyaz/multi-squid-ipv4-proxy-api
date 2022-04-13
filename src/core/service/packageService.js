/**
 * Created by pooya on 8/25/21.
 */

const UserModel = require('~src/core/model/userModel');
const PackageModel = require('~src/core/model/packageModel');
const IPackageService = require('~src/core/interface/iPackageService');
const NotFoundException = require('~src/core/exception/notFoundException');
const ItemDisableException = require('~src/core/exception/itemDisableException');
const DisableUserException = require('~src/core/exception/disableUserException');
const AlreadyExpireException = require('~src/core/exception/alreadyExpireException');

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
      if (data.expireDate instanceof Date && data.expireDate.getTime() < new Date().getTime()) {
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
    model.status = PackageModel.STATUS_ENABLE;
    const [addError, addData] = await this.#packageRepository.add(model);
    if (addError) {
      return [addError];
    }

    const [addFileError] = await this.#packageFileRepository.add(addData);
    if (addFileError) {
      return [addFileError];
    }

    addData.password = fetchData.password;

    this._reloadServer();

    return [null, addData];
  }

  async renew(id, expireDate) {
    const [fetchError, fetchData] = await this._getPackageInfoIfExistById(id);
    if (fetchError) {
      return [fetchError];
    }
    if (
      fetchData.expireDate instanceof Date &&
      fetchData.expireDate.getTime() <= new Date().getTime()
    ) {
      return [new AlreadyExpireException()];
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

  async cancel(id) {
    const [fetchError, fetchData] = await this._getPackageInfoIfExistById(id);
    if (fetchError) {
      return [fetchError];
    }
    if (fetchData.status !== PackageModel.STATUS_ENABLE) {
      return [new ItemDisableException()];
    }
    if (
      fetchData.expireDate instanceof Date &&
      fetchData.expireDate.getTime() <= new Date().getTime()
    ) {
      return [new AlreadyExpireException()];
    }

    const now = new Date();
    const cancelModel = new PackageModel();
    cancelModel.id = id;
    cancelModel.status = PackageModel.STATUS_CANCEL;
    cancelModel.expireDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [error] = await this.#packageRepository.update(cancelModel);
    if (error) {
      return [error];
    }
    const [updateError] = await this.#packageFileRepository.update(cancelModel);
    if (updateError) {
      console.error('updateCancelPackage', updateError);
    } else {
      this._reloadServer();
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

    packageData.expireDate = new Date();
    const [removePackageError] = await this.#packageRepository.update(packageData);
    if (removePackageError) {
      return [removePackageError];
    }

    this._reloadServer();

    return [null];
  }

  async syncPackageById(id) {
    const [errorFetchPackage, dataFetchPackage] = await this.#packageRepository.getById(id);
    if (errorFetchPackage) {
      return [errorFetchPackage];
    }
    if (!dataFetchPackage) {
      return [new NotFoundException()];
    }
    const [errorFetchUser, dataFetchUser] = await this._getUserModelByUsername(
      dataFetchPackage.username,
    );
    if (errorFetchUser) {
      return [errorFetchUser];
    }
    if (
      (dataFetchPackage.expireDate instanceof Date &&
        dataFetchPackage.expireDate.getTime() <= new Date().getTime()) ||
      dataFetchPackage.deleteDate ||
      !dataFetchUser.isEnable
    ) {
      return [null];
    }

    dataFetchPackage.expireDate = null;
    dataFetchPackage.deleteDate = null;
    const [error] = await this.#packageFileRepository.update(dataFetchPackage);
    if (error) {
      return [error];
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

  async _getPackageInfoIfExistById(id) {
    const [fetchError, fetchData] = await this.#packageRepository.getById(id);
    if (fetchError) {
      return [fetchError];
    }
    if (!fetchData) {
      return [new NotFoundException()];
    }

    return [null, fetchData];
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
