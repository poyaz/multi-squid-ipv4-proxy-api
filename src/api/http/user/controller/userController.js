/**
 * Created by pooya on 8/23/21.
 */

const AddUserInputModel = require('./model/addUserInputModel');
const AddUserOutputModel = require('./model/addUserOutputModel');
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
    const [error, data] = await this.#userService.getAll();
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
}

module.exports = UserController;
