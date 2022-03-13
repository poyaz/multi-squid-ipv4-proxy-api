/**
 * Created by pooya on 3/13/22.
 */

const OauthController = require('~src/api/http/oauth/oauthController');

class OauthControllerFactory {
  /**
   * @type {IExternalAuthService}
   */
  #externalAuthService;
  /**
   * @type {IDateTime}
   */
  #dateTime;

  /**
   *
   * @param {IExternalAuthService} externalAuthService
   * @param {IDateTime} dateTime
   */
  constructor(externalAuthService, dateTime) {
    this.#externalAuthService = externalAuthService;
    this.#dateTime = dateTime;
  }

  /**
   *
   * @param req
   * @param res
   * @return {OauthController}
   */
  create(req, res) {
    return new OauthController(req, res, this.#externalAuthService, this.#dateTime);
  }
}

module.exports = OauthControllerFactory;
