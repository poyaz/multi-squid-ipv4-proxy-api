/**
 * Created by pooya on 8/29/21.
 */

const UserController = require('./userController');

class UserControllerFactory {
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
   * @param {IUserService} userService
   * @param {IDateTime} dateTime
   * @param {IUrlAccessService} urlAccessService
   */
  constructor(userService, dateTime, urlAccessService) {
    this.#userService = userService;
    this.#dateTime = dateTime;
    this.#urlAccessService = urlAccessService;
  }

  /**
   *
   * @param req
   * @param res
   * @return {UserController}
   */
  create(req, res) {
    return new UserController(req, res, this.#userService, this.#dateTime, this.#urlAccessService);
  }
}

module.exports = UserControllerFactory;
