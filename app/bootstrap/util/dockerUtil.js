/**
 * Created by pooya on 8/31/21.
 */

const Docker = require('dockerode');
const IRunner = require('~interface/iRunner');

class DockerUtil extends IRunner {
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
    return new Docker({
      protocol: this._config.getStr('custom.docker.protocol'),
      host: this._config.getStr('custom.docker.host'),
      port: this._config.getNum('custom.docker.port'),
    });
  }
}

module.exports = DockerUtil;
