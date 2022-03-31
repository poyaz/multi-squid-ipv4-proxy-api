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
  #oauthHtmlPage;

  /**
   *
   * @param {IExternalAuthService} externalAuthService
   * @param jwt
   * @param {Object<address: string, key: string>} oauthHtmlPage
   */
  constructor(externalAuthService, jwt, oauthHtmlPage) {
    this.#externalAuthService = externalAuthService;
    this.#jwt = jwt;
    this.#oauthHtmlPage = oauthHtmlPage;
  }

  /**
   *
   * @param req
   * @param res
   * @return {OauthController}
   */
  create(req, res) {
    return new OauthController(req, res, this.#externalAuthService, this.#jwt, this.#oauthHtmlPage);
  }
}

module.exports = OauthControllerFactory;
