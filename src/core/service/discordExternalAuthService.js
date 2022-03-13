/**
 * Created by pooya on 3/13/22.
 */

const OauthModel = require('~src/core/model/oauthModel');
const IExternalAuthService = require('~src/core/interface/iExternalAuthService');

class DiscordExternalAuthService extends IExternalAuthService {
  /**
   * @type {{auth: Object, config: {redirectUrl: string, id: string}, platform: string}}
   */
  #externalAuth;
  /**
   * @type {IUserService}
   */
  #userService;
  #platform = 'discord';

  /**
   *
   * @param {{auth: Object, config: {redirectUrl: string, id: string}, platform: string}} externalAuth
   * @param {IUserService} userService
   */
  constructor(externalAuth, userService) {
    super();

    this.#externalAuth = externalAuth;
    this.#userService = userService;
  }

  async getOptions(_platform) {
    const model = new OauthModel();
    model.id = this.#externalAuth.config.id;
    model.platform = this.#platform;
    model.redirectUrl = this.#externalAuth.config.redirectUrl;

    return [null, model];
  }
}

module.exports = DiscordExternalAuthService;
