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
   *
   * @param {IUserService} userService
   * @param {IServerService} serverService
   * @param {IServerApiRepository} serverApiRepository
   */
  constructor(userService, serverService, serverApiRepository) {
    super();

    this.#userService = userService;
    this.#serverService = serverService;
    this.#serverApiRepository = serverApiRepository;
  }

  async getAll(filterModel) {
    return this.#userService.getAll(filterModel);
  }
}

module.exports = FindClusterUserService;
