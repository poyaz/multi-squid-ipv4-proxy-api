/**
 * Created by pooya on 8/25/21.
 */

const UserModel = require('~src/core/model/userModel');
const IPackageService = require('~src/core/interface/iPackageService');
const NotFoundException = require('~src/core/exception/notFoundException');
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
