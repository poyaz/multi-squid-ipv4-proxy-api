/**
 * Created by pooya on 3/13/22.
 */

const OauthController = require('./oauthController');

class OauthControllerFactory {
  /**
   * @type {IExternalAuthService}
   */
  #externalAuthService;
  #jwt;

  /**
   *
   * @param {IExternalAuthService} externalAuthService
   * @param jwt
   */
  constructor(externalAuthService, jwt) {
    this.#externalAuthService = externalAuthService;
    this.#jwt = jwt;
  }

  /**
   *
   * @param req
   * @param res
   * @return {OauthController}
   */
  create(req, res) {
    return new OauthController(req, res, this.#externalAuthService, this.#jwt);
  }
}

module.exports = OauthControllerFactory;
