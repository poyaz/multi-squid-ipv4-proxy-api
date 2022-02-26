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

  /**
   *
   * @param {IUserService} userService
   * @param {IUserService} findClusterUserService
   * @param {IDateTime} dateTime
   * @param {IUrlAccessService} urlAccessService
   */
  constructor(userService, findClusterUserService, dateTime, urlAccessService) {
    this.#userService = userService;
    this.#findClusterUserService = findClusterUserService;
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
    return new UserController(
      req,
      res,
      this.#userService,
      this.#findClusterUserService,
      this.#dateTime,
      this.#urlAccessService,
    );
  }
}

module.exports = UserControllerFactory;
