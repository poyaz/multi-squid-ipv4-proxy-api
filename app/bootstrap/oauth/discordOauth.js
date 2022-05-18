/**
 * Created by pooya on 3/13/22.
 */

const DiscordOauth2 = require('discord-oauth2');
const IRunner = require('~interface/iRunner');
const { hostBuilder } = require('~src/utility');

class DiscordOauth extends IRunner {
  #oauthPath = '/api/v1/oauth/discord/callback';

  /**
   *
   * @param {IConfig} config
   * @param {Object} options
   * @param {*} dependency
   */
  constructor(config, options, dependency) {
    super();

    this._config = config;
    this._options = options;
    this._cwd = options.cwd;
    this._dependency = dependency;
  }

  async start() {
    const options = {
      clientId: this._config.getStr('custom.oauth.discord.id'),
      clientSecret: this._config.getStr('custom.oauth.discord.secret'),
      cdn: this._config.getStr('custom.oauth.discord.cdn', ''),
      redirectUri: null,
    };

    const host = this._config.getStr('server.host');
    const publicHost = this._config.getStr('server.public.host');
    if (publicHost) {
      const publicHttpPort = this._config.getNum('server.public.http.port');
      const publicHttpsPort = this._config.getNum('server.public.https.port');
      const force = Boolean(publicHttpsPort);

      options.redirectUri = hostBuilder(publicHost, publicHttpPort, publicHttpsPort, force);
    } else {
      const httpPort = this._config.getNum('server.http.port');
      const httpsPort = this._config.getNum('server.https.port');
      const force = this._config.getBool('server.https.force', false);

      options.redirectUri = hostBuilder(host, httpPort, httpsPort, force);
    }

    options.redirectUri += this.#oauthPath;

    const auth = new DiscordOauth2(options);

    return {
      platform: 'discord',
      config: {
        id: options.clientId,
        redirectUrl: options.redirectUri,
        cdnUrl: options.cdn.substr(-1) === '/' ? options.cdn : `${options.cdn}/`,
      },
      auth,
    };
  }
}

module.exports = DiscordOauth;
