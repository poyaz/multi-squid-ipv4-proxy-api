/**
 * Created by pooya on 3/13/22.
 */

const UserModel = require('~src/core/model/userModel');
const OauthModel = require('~src/core/model/oauthModel');
const IExternalAuthService = require('~src/core/interface/iExternalAuthService');
const UserExistException = require('~src/core/exception/userExistException');
const ExternalAuthException = require('~src/core/exception/externalAuthException');

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

    return [null, [model]];
  }

  async auth(_platform) {
    try {
      const url = this.#externalAuth.auth.generateAuthUrl({
        grantType: 'authorization_code',
        scope: ['identify'],
      });

      return [null, url];
    } catch (error) {
      return [new ExternalAuthException(error)];
    }
  }

  async verify(platform, code) {
    try {
      const tokenInfo = await this.#externalAuth.auth.tokenRequest({
        code,
        grantType: 'authorization_code',
        scope: ['identify'],
      });
      const userInfo = await this.#externalAuth.auth.getUser(tokenInfo['access_token']);

      const model = new UserModel();
      model.username = userInfo['username'];
      model.password = `${new Date().getTime()}${Math.floor(Math.random() * 100000) + 10}`;
      model.role = 'user';
      model.externalOauthData = { discordId: userInfo['discriminator'] };

      const [addUserError, addUserData] = await this.#userService.add(model);
      if (addUserError && !(addUserError instanceof UserExistException)) {
        return [addUserError];
      }
      if (addUserError instanceof UserExistException) {
        const filterModel = new UserModel();
        filterModel.username = model.username;

        const [fetchUserError, fetchUserData] = await this.#userService.getAll(filterModel);
        if (fetchUserError) {
          return [fetchUserError];
        }

        return [null, fetchUserData[0]];
      }

      return [null, addUserData];
    } catch (error) {
      return [new ExternalAuthException(error)];
    }
  }
}

module.exports = DiscordExternalAuthService;
