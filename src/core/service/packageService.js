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
const NoUniqueIpException = require('~src/core/exception/noUniqueIpException');
const NoUniqueUserIpException = require('~src/core/exception/noUniqueUserIpException');
const RequestIpMoreThanExistIpException = require('~src/core/exception/requestIpMoreThanExistIpException');

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

  async getById(id) {
    const [fetchError, fetchData] = await this.#packageRepository.getById(id);
    if (fetchError) {
      return [fetchError];
    }
    if (!fetchData) {
      return [new NotFoundException()];
    }

    return [null, fetchData];
  }

  async getAllByUsername(username, filterModel) {
    const [existError] = await this._getUserModelByUsername(username);
    if (existError) {
      return [existError];
    }

    const [fetchError, fetchData] = await this.#packageRepository.getAllByUsername(
      username,
      filterModel,
    );
    if (fetchError) {
      return [fetchError];
    }

    const [fetchFileError, fetchFileData] = await this.#packageFileRepository.getAllByUsername(
      username,
      filterModel,
    );
    if (fetchFileError) {
      return [fetchFileError];
    }

    const result = [];
    const validRunningIpList = fetchFileData.length > 0 ? fetchFileData[0].ipList : [];
    for (let i = 0; i < fetchData.length; i++) {
      const data = fetchData[i];

      if (data.status === PackageModel.STATUS_ENABLE && validRunningIpList.length === 0) {
        continue;
      }

      if (data.status === PackageModel.STATUS_ENABLE) {
        const validMatchIpList = data.ipList.filter((source) =>
          validRunningIpList.find((find) => source.ip === find.ip),
        );

        data.countIp = validMatchIpList.length;
        data.ipList = validMatchIpList;
      }

      result.push(data);
    }

    return [null, result];
  }

  async checkIpExistForCreatePackage(model) {
    const [userError, userData] = await this.#userService.getUserById(model.userId);
    if (userError) {
      return [userError];
    }
    if (!userData.isEnable) {
      return [new DisableUserException()];
    }

    const [error, countIp, countUserIp] = await this.#packageRepository.countOfIpExist(
      model.userId,
      model.type,
      model.country,
    );
    if (error) {
      return [error];
    }
    if (countIp === 0) {
      return [new NoUniqueIpException()];
    }
    if (countUserIp === 0) {
      return [new NoUniqueUserIpException()];
    }
    if (model.countIp > countIp || model.countIp > countUserIp) {
      return [new RequestIpMoreThanExistIpException()];
    }

    return [null];
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

  async renewal(id, renewalDate) {
    const [fetchError, fetchData] = await this._getPackageInfoIfExistById(id);
    if (fetchError) {
      return [fetchError];
    }
    if (fetchData.status !== PackageModel.STATUS_ENABLE) {
      return [new ItemDisableException()];
    }

    const updateModel = new PackageModel();
    updateModel.id = id;
    updateModel.renewalDate = renewalDate;

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

    const packageModelExpireList = [];
    if (expirePackageList.length === 0) {
      return [null, packageModelExpireList];
    }

    let totalSuccessfulExpireCount = 0;
    for await (const expirePackage of expirePackageList) {
      const [updateProxyFileError] = await this.#packageFileRepository.update(expirePackage);
      if (updateProxyFileError) {
        console.error('updateExpirePackage', updateProxyFileError);
        continue;
      }

      const expireStatusPackage = new PackageModel();
      expireStatusPackage.id = expirePackage.id;
      expireStatusPackage.status = PackageModel.STATUS_EXPIRE;
      const [updateStatusError] = await this.#packageRepository.update(expireStatusPackage);
      if (updateStatusError) {
        console.error('updateStatusExpirePackage', updateStatusError);
        continue;
      }

      totalSuccessfulExpireCount++;
      packageModelExpireList.push(expirePackage);
    }

    if (totalSuccessfulExpireCount > 0) {
      this._reloadServer();
    }

    return [null, packageModelExpireList];
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
    const [errorFetchPackage, dataFetchPackage] = await this.#packageRepository.getById(id, true);
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
    if (!dataFetchUser.isEnable) {
      dataFetchPackage.deleteDate = new Date();
    } else {
      dataFetchPackage.deleteDate = null;
    }

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
