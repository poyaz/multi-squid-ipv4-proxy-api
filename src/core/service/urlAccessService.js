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
   * @type {boolean}
   */
  #hasEnableBlockUrl;

  /**
   *
   * @param {IUserService} userService
   * @param {IUrlAccessRepository} urlAccessRepository
   * @param {boolean} hasEnableBlockUrl
   */
  constructor(userService, urlAccessRepository, hasEnableBlockUrl) {
    super();

    this.#userService = userService;
    this.#urlAccessRepository = urlAccessRepository;
    this.#hasEnableBlockUrl = hasEnableBlockUrl;
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

  async checkBlockDomainForUsername(username, domain) {
    if (!this.#hasEnableBlockUrl) {
      return [null, false];
    }

    const [fetchError, fetchData] = await this._getUserModelByUsername(username);
    if (fetchError) {
      return [fetchError];
    }

    const [checkError, checkData] = await this.#urlAccessRepository.checkBlockDomainByUserId(
      fetchData.id,
      domain,
    );
    if (checkError) {
      return [checkError];
    }

    return [null, checkData];
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
