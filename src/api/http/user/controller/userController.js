/**
 * Created by pooya on 8/23/21.
 */

const AddUserInputModel = require('./model/addUserInputModel');
const AddUserOutputModel = require('./model/addUserOutputModel');
const GetAllUserInputModel = require('./model/getAllUserInputModel');
const GetAllUserOutputModel = require('./model/getAllUserOutputModel');

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
   *
   * @param req
   * @param res
   * @param {IUserService} userService
   * @param {IDateTime} dateTime
   */
  constructor(req, res, userService, dateTime) {
    this.#req = req;
    this.#res = res;
    this.#userService = userService;
    this.#dateTime = dateTime;
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
}

module.exports = UserController;
