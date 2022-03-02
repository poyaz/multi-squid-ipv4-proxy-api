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
  #jwt;

  /**
   *
   * @param {IUserService} userService
   * @param {IUserService} findClusterUserService
   * @param {IDateTime} dateTime
   * @param {IUrlAccessService} urlAccessService
   */
  constructor(userService, findClusterUserService, dateTime, urlAccessService, jwt) {
    this.#userService = userService;
    this.#findClusterUserService = findClusterUserService;
    this.#dateTime = dateTime;
    this.#urlAccessService = urlAccessService;
    this.#jwt = jwt;
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
      this.#jwt,
    );
  }
}

module.exports = UserControllerFactory;
