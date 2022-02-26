/**
 * Created by pooya on 2/21/22.
 */

const IRunner = require('~interface/iRunner');

class ApiCluster extends IRunner {
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
    const { jwt } = this._dependency;

    return { apiToken: `Bearer ${jwt.sign({ role: 'admin' })}` };
  }
}

module.exports = ApiCluster;
