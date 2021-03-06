/**
 * Created by pooya on 8/23/21.
 */

const UserModel = require('~src/core/model/userModel');
const PackageModel = require('~src/core/model/packageModel');
const IUserService = require('~src/core/interface/iUserService');
const NotFoundException = require('~src/core/exception/notFoundException');
const UserExistException = require('~src/core/exception/userExistException');
const UserDisableException = require('~src/core/exception/userDisableException');
const AuthenticateFailException = require('~src/core/exception/authenticateFailException');

class UserService extends IUserService {
  /**
   * @type {IUserRepository}
   */
  #userRepository;
  /**
   * @type {IUserRepository}
   */
  #userSquidRepository;
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
   * @param {IUserRepository} userRepository
   * @param {IUserRepository} userSquidRepository
   * @param {IPackageRepository} packageFileRepository
   * @param {IProxyServerRepository} proxySquidRepository
   */
  constructor(userRepository, userSquidRepository, packageFileRepository, proxySquidRepository) {
    super();

    this.#userRepository = userRepository;
    this.#userSquidRepository = userSquidRepository;
    this.#packageFileRepository = packageFileRepository;
    this.#proxySquidRepository = proxySquidRepository;
  }

  async getAll(filterInput) {
    return this.#userRepository.getAll(filterInput);
  }

  async getUserById(userId) {
    const [error, data] = await this.#userRepository.getUserById(userId);
    if (error) {
      return [error];
    }
    if (!data) {
      return [new NotFoundException()];
    }

    return [null, data];
  }

  async checkUsernameAndPassword(username, password) {
    const [errorCheck, dataCheck] = await this.#userSquidRepository.checkUsernameAndPassword(
      username,
      password,
    );
    if (errorCheck) {
      return [errorCheck];
    }
    if (!dataCheck) {
      return [new AuthenticateFailException()];
    }

    const filterModel = new UserModel();
    filterModel.username = username;
    const [errorFetch, dataFetch] = await this.#userRepository.getAll(filterModel);
    if (errorFetch) {
      return [errorFetch];
    }
    if (dataFetch.length === 0) {
      return [new AuthenticateFailException()];
    }
    if (!dataFetch[0].isEnable) {
      return [new UserDisableException()];
    }

    return [null, dataFetch[0]];
  }

  async add(model) {
    const [checkExistError, checkExistData] = await this.#userRepository.isUserExist(
      model.username,
    );
    if (checkExistError) {
      return [checkExistError];
    }

    const [checkProxyExistError, checkProxyExistData] = await this.#userSquidRepository.isUserExist(
      model.username,
    );
    if (checkProxyExistError) {
      return [checkProxyExistError];
    }

    if (checkExistData && checkProxyExistData) {
      return [new UserExistException()];
    }

    model.role = 'user';
    const [addError, addData] = await this.#userRepository.add(model);
    if (addError) {
      return [addError];
    }

    const [addProxyError] = await this.#userSquidRepository.add(model);
    if (addProxyError) {
      return [addProxyError];
    }

    return [null, addData];
  }

  async addAdmin(model) {
    const [checkExistError, checkExistData] = await this.#userRepository.isUserExist(
      model.username,
    );
    if (checkExistError) {
      return [checkExistError];
    }

    const [checkProxyExistError, checkProxyExistData] = await this.#userSquidRepository.isUserExist(
      model.username,
    );
    if (checkProxyExistError) {
      return [checkProxyExistError];
    }

    if (checkExistData && checkProxyExistData) {
      return [new UserExistException()];
    }

    model.role = 'admin';
    const [addError, addData] = await this.#userRepository.add(model);
    if (addError) {
      return [addError];
    }

    const [addProxyError] = await this.#userSquidRepository.add(model);
    if (addProxyError) {
      return [addProxyError];
    }

    return [null, addData];
  }

  async changePassword(username, password) {
    const filterModel = new UserModel();
    filterModel.username = username;
    const [fetchError, fetchData] = await this.#userRepository.getAll(filterModel);
    if (fetchError) {
      return [fetchError];
    }
    if (fetchData.length === 0) {
      return [new NotFoundException()];
    }

    const updateModel = new UserModel();
    updateModel.id = fetchData[0].id;
    updateModel.username = username;
    updateModel.password = password;
    const [updateError] = await this.#userSquidRepository.update(updateModel);
    if (updateError) {
      return [updateError];
    }

    const [updateUserError] = await this.#userRepository.update(updateModel);
    if (updateUserError) {
      return [updateUserError];
    }

    return [null];
  }

  async disableByUsername(username) {
    const [fetchError, fetchData] = await this._getUserModelByUsername(username);
    if (fetchError) {
      return [fetchError];
    }

    const updateModel = fetchData.clone();
    updateModel.isEnable = false;

    const [updateError] = await this.#userRepository.update(updateModel);
    if (updateError) {
      return [updateError];
    }

    const disableUserPackage = new PackageModel();
    disableUserPackage.username = username;
    disableUserPackage.deleteDate = new Date();

    const [updatePackageError] = await this.#packageFileRepository.update(disableUserPackage);
    if (updatePackageError) {
      return [updatePackageError];
    }

    this._reloadServer();

    return [null];
  }

  async enableByUsername(username) {
    const [fetchError, fetchData] = await this._getUserModelByUsername(username);
    if (fetchError) {
      return [fetchError];
    }

    const updateModel = fetchData.clone();
    updateModel.isEnable = true;

    const [updateError] = await this.#userRepository.update(updateModel);
    if (updateError) {
      return [updateError];
    }

    const enableUserPackage = new PackageModel();
    enableUserPackage.username = username;

    const [updatePackageError] = await this.#packageFileRepository.update(enableUserPackage);
    if (updatePackageError) {
      return [updatePackageError];
    }

    this._reloadServer();

    return [null];
  }

  async update(model) {
    return this.#userRepository.update(model);
  }

  async _getUserModelByUsername(username) {
    const filterModel = new UserModel();
    filterModel.username = username;

    const [fetchError, fetchData] = await this.#userRepository.getAll(filterModel);
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

module.exports = UserService;
