/**
 * Created by pooya on 8/23/21.
 */

class UserController {
  #req;
  #res;
  /**
   * @type {IUserService}
   */
  #userService;

  /**
   *
   * @param req
   * @param res
   * @param {IUserService} userService
   */
  constructor(req, res, userService) {
    this.#req = req;
    this.#res = res;
    this.#userService = userService;
  }
}

module.exports = UserController;
