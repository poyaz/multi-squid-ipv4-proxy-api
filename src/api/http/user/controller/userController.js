/**
 * Created by pooya on 8/23/21.
 */

const AddUserInputModel = require('./model/addUserInputModel');
const AddUserOutputModel = require('./model/addUserOutputModel');
const GetAllUserInputModel = require('./model/getAllUserInputModel');
const GetAllUserOutputModel = require('./model/getAllUserOutputModel');
const BlockUrlForUserInputModel = require('./model/blockUrlForUserInputModel');

class UserController {
  #req;
  #res;
  /**
   * @type {IUserService}
   */
  #userService;
  /**
   * @type {IDateTime}
   */
  #dateTime;
  /**
   * @type {IUrlAccessService}
   */
  #urlAccessService;

  /**
   *
   * @param req
   * @param res
   * @param {IUserService} userService
   * @param {IDateTime} dateTime
   * @param {IUrlAccessService} urlAccessService
   */
  constructor(req, res, userService, dateTime, urlAccessService) {
    this.#req = req;
    this.#res = res;
    this.#userService = userService;
    this.#dateTime = dateTime;
    this.#urlAccessService = urlAccessService;
  }

  async getAllUsers() {
    const qs = this.#req.query;

    const getAllUserInputModel = new GetAllUserInputModel();
    const filterModel = getAllUserInputModel.getModel(qs);

    const [error, data] = await this.#userService.getAll(filterModel);
    if (error) {
      return [error];
    }

    const getAllUserOutputModel = new GetAllUserOutputModel(this.#dateTime);
    const result = getAllUserOutputModel.getOutput(data);

    return [null, result];
  }

  async addUser() {
    const { body } = this.#req;

    const addUserInputModel = new AddUserInputModel();
    const model = addUserInputModel.getModel(body);

    const [error, data] = await this.#userService.add(model);
    if (error) {
      return [error];
    }

    const addUserOutputModel = new AddUserOutputModel(this.#dateTime);
    const result = addUserOutputModel.getOutput(data);

    return [null, result];
  }

  async changePassword() {
    const { username } = this.#req.params;
    const { password } = this.#req.body;

    const [error] = await this.#userService.changePassword(username, password);
    if (error) {
      return [error];
    }

    return [null];
  }

  async disableByUsername() {
    const { username } = this.#req.params;

    const [error] = await this.#userService.disableByUsername(username);
    if (error) {
      return [error];
    }

    return [null];
  }

  async enableByUsername() {
    const { username } = this.#req.params;

    const [error] = await this.#userService.enableByUsername(username);
    if (error) {
      return [error];
    }

    return [null];
  }

  async blockAccessToUrlByUsername() {
    const { username } = this.#req.params;
    const { body } = this.#req;

    const blockUrlForUserInputModel = new BlockUrlForUserInputModel(this.#dateTime, username);
    const model = blockUrlForUserInputModel.getModel(body);

    const [error] = await this.#urlAccessService.add(model);
    if (error) {
      return [error];
    }

    return [null];
  }

  async checkBlockUrlForUsername() {
    const { username, url } = this.#req.params;

    const [error, data] = await this.#urlAccessService.checkBlockUrlForUsername(username, url);
    if (error) {
      return [error];
    }

    return [null, { isBlock: data }];
  }
}

module.exports = UserController;
