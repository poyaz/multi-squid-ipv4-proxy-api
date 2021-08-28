/**
 * Created by pooya on 8/28/21.
 */

const UserModel = require('~src/core/model/userModel');
const IUrlAccessService = require('~src/core/interface/iUrlAccessService');
const NotFoundException = require('~src/core/exception/notFoundException');

class UrlAccessService extends IUrlAccessService {
  /**
   * @type {IUserService}
   */
  #userService;
  /**
   * @type {IUrlAccessRepository}
   */
  #urlAccessRepository;

  /**
   *
   * @param {IUserService} userService
   * @param {IUrlAccessRepository} urlAccessRepository
   */
  constructor(userService, urlAccessRepository) {
    super();

    this.#userService = userService;
    this.#urlAccessRepository = urlAccessRepository;
  }

  async add(model) {
    const [fetchError, fetchData] = await this._getUserModelByUsername(model.username);
    if (fetchError) {
      return [fetchError];
    }

    model.userId = fetchData.id;
    const [addError, addData] = await this.#urlAccessRepository.add(model);
    if (addError) {
      return [addError];
    }

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
}

module.exports = UrlAccessService;
