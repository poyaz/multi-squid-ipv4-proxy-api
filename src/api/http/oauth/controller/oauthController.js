/**
 * Created by pooya on 3/13/22.
 */

const GetOptionsOutputModel = require('./model/getOptionsOutputModel');
const LoginExternalUserOutputModel = require('./model/loginExternalUserOutputModel');

class OauthController {
  #req;
  #res;
  /**
   * @type {IExternalAuthService}
   */
  #externalAuthService;
  #jwt;
  #oauthHtmlPage;

  /**
   *
   * @param req
   * @param res
   * @param {IExternalAuthService} externalAuthService
   * @param jwt
   * @param {Object<address: string, key: string>} oauthHtmlPage
   */
  constructor(req, res, externalAuthService, jwt, oauthHtmlPage) {
    this.#req = req;
    this.#res = res;
    this.#externalAuthService = externalAuthService;
    this.#jwt = jwt;
    this.#oauthHtmlPage = oauthHtmlPage;
  }

  async getOptions() {
    const { platform } = this.#req.params;

    const [error, data] = await this.#externalAuthService.getOptions(platform);
    if (error) {
      return [error];
    }

    const getOptionsOutputModel = new GetOptionsOutputModel();
    const result = getOptionsOutputModel.getOutput(data);

    return [null, result];
  }

  async auth() {
    const { platform } = this.#req.params;

    const [error, data] = await this.#externalAuthService.auth(platform);
    if (error) {
      return [error];
    }

    return [null, data];
  }

  async verify() {
    const { platform } = this.#req.params;
    const { code } = this.#req.query;

    const [error, data] = await this.#externalAuthService.verify(platform, code);
    if (error) {
      return [error];
    }

    const loginExternalUserOutputModel = new LoginExternalUserOutputModel(this.#jwt);
    const result = loginExternalUserOutputModel.getOutput(data);

    const redirectUrl = this.#oauthHtmlPage.address.replaceAll(this.#oauthHtmlPage.key, result.token);

    return [null, redirectUrl];
  }
}

module.exports = OauthController;
