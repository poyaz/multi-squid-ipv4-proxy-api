/**
 * Created by pooya on 8/23/21.
 */

const UserModel = require('~src/core/model/userModel');
const IUserService = require('~src/core/interface/iUserService');
const NotFoundException = require('~src/core/exception/notFoundException');
const UserExistException = require('~src/core/exception/userExistException');

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
   *
   * @param {IUserRepository} userRepository
   * @param {IUserRepository} userSquidRepository
   */
  constructor(userRepository, userSquidRepository) {
    super();

    this.#userRepository = userRepository;
    this.#userSquidRepository = userSquidRepository;
  }

  async getAll(filterInput) {
    return this.#userRepository.getAll(filterInput);
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
    const [existError, existData] = await this.#userRepository.isUserExist(username);
    if (existError) {
      return [existError];
    }
    if (!existData) {
      return [new NotFoundException()];
    }

    const updateModel = new UserModel();
    updateModel.username = username;
    updateModel.password = password;
    const [updateError] = await this.#userSquidRepository.update(updateModel);
    if (updateModel) {
      return [updateError];
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

    return [null];
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
}

module.exports = UserService;
