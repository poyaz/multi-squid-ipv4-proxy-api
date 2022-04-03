/**
 * Created by pooya on 8/23/21.
 */

const AddUserInputModel = require('./model/addUserInputModel');
const AddUserOutputModel = require('./model/addUserOutputModel');
const LoginUserOutputModel = require('./model/loginUserOutputModel');
const GetAllUserInputModel = require('./model/getAllUserInputModel');
const GetAllUserOutputModel = require('./model/getAllUserOutputModel');
const BlockUrlForUserInputModel = require('./model/blockUrlForUserInputModel');
const BaseUserOutputModel = require('./model/baseUserOutputModel');

class UserController {
  #req;
  #res;
  /**
   * @type {IUserService}
   */
  #userService;
  /**
   * @type {IUserService}
   */
  #findClusterUserService;
  /**
   * @type {IDateTime}
   */
  #dateTime;
  /**
   * @type {IUrlAccessService}
   */
  #urlAccessService;
  #jwt;

  /**
   *
   * @param req
   * @param res
   * @param {IUserService} userService
   * @param {IUserService} findClusterUserService
   * @param {IDateTime} dateTime
   * @param {IUrlAccessService} urlAccessService
   * @param jwt
   */
  constructor(req, res, userService, findClusterUserService, dateTime, urlAccessService, jwt) {
    this.#req = req;
    this.#res = res;
    this.#userService = userService;
    this.#findClusterUserService = findClusterUserService;
    this.#dateTime = dateTime;
    this.#urlAccessService = urlAccessService;
    this.#jwt = jwt;
  }

  async getAllUsers() {
    const qs = this.#req.query;

    const getAllUserInputModel = new GetAllUserInputModel();
    const filterModel = getAllUserInputModel.getModel(qs);

    const [error, data] = await this.#findClusterUserService.getAll(filterModel);
    if (error) {
      return [error];
    }

    const getAllUserOutputModel = new GetAllUserOutputModel(this.#dateTime);
    const result = getAllUserOutputModel.getOutput(data);

    return [null, result];
  }

  async getUserById() {
    const { userId } = this.#req.params;

    const [error, data] = await this.#findClusterUserService.getUserById(userId);
    if (error) {
      return [error];
    }

    const baseUserOutputModel = new BaseUserOutputModel(this.#dateTime);
    const result = baseUserOutputModel.getOutput(data);

    return [null, result];
  }

  async addUser() {
    const { body } = this.#req;

    const addUserInputModel = new AddUserInputModel();
    const model = addUserInputModel.getModel(body);

    const [error, data] = await this.#findClusterUserService.add(model);
    if (error) {
      return [error];
    }

    const addUserOutputModel = new AddUserOutputModel(this.#dateTime);
    const result = addUserOutputModel.getOutput(data);

    return [null, result];
  }

  async loginUser() {
    const { body } = this.#req;

    const addUserInputModel = new AddUserInputModel();
    const model = addUserInputModel.getModel(body);

    const [error, data] = await this.#findClusterUserService.checkUsernameAndPassword(
      model.username,
      model.password,
    );
    if (error) {
      return [error];
    }

    const loginUserOutputModel = new LoginUserOutputModel(this.#jwt);
    const result = loginUserOutputModel.getOutput(data);

    return [null, result];
  }

  async changePassword() {
    const { username } = this.#req.params;
    const { password } = this.#req.body;

    const [error] = await this.#findClusterUserService.changePassword(username, password);
    if (error) {
      return [error];
    }

    return [null];
  }

  async disableByUsername() {
    const { username } = this.#req.params;

    const [error] = await this.#findClusterUserService.disableByUsername(username);
    if (error) {
      return [error];
    }

    return [null];
  }

  async enableByUsername() {
    const { username } = this.#req.params;

    const [error] = await this.#findClusterUserService.enableByUsername(username);
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

  async checkBlockDomainForUsername() {
    const { username, domain } = this.#req.params;

    const [error, data] = await this.#urlAccessService.checkBlockDomainForUsername(
      username,
      domain,
    );
    if (error) {
      return [error];
    }

    return [null, { isBlock: data }];
  }

  async addUserInSelfInstance() {
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

  async changePasswordInSelfInstance() {
    const { username } = this.#req.params;
    const { password } = this.#req.body;

    const [error] = await this.#userService.changePassword(username, password);
    if (error) {
      return [error];
    }

    return [null];
  }

  async disableByUsernameInSelfInstance() {
    const { username } = this.#req.params;

    const [error] = await this.#userService.disableByUsername(username);
    if (error) {
      return [error];
    }

    return [null];
  }

  async enableByUsernameInSelfInstance() {
    const { username } = this.#req.params;

    const [error] = await this.#userService.enableByUsername(username);
    if (error) {
      return [error];
    }

    return [null];
  }
}

module.exports = UserController;
