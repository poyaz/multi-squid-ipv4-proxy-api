/**
 * Created by pooya on 8/23/21.
 */

const IUserService = require('~src/core/interface/iUserService');
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
}

module.exports = UserService;
