/**
 * Created by pooya on 9/2/21.
 */

const IRunner = require('~interface/iRunner');

class CronjobApi extends IRunner {
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
    const packageCronjob = this._dependency.packageCronjob;
    const reloadCronjob = this._dependency.reloadCronjob;

    setInterval(async () => {
      await packageCronjob.disableExpirePackage();
    }, 10 * 60 * 1000);

    setInterval(async () => {
      await reloadCronjob.reload();
    }, 20 * 60 * 1000);
  }
}

module.exports = CronjobApi;
