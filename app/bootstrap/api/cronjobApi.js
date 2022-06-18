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
    this._delay = Number(Math.random().toFixed(1));
  }

  async start() {
    const packageCronjob = this._dependency.packageCronjob;
    const reloadCronjob = this._dependency.reloadCronjob;
    const syncCronjob = this._dependency.syncCronjob;

    setInterval(async () => {
      await packageCronjob.disableExpirePackage();
    }, 10 * 60 * 1000);

    setInterval(async () => {
      await reloadCronjob.reload();
    }, 24 * 60 * 60 * 1000);

    setInterval(async () => {
      await syncCronjob.executePackageHasBeenSynced();
    }, this._delay * 2 * 60 * 1000);

    setInterval(async () => {
      await syncCronjob.executeOrderHasBeenCanceled();
    }, this._delay * 10 * 60 * 1000);

    setInterval(async () => {
      await syncCronjob.executePackageHasBeenExpired();
    }, this._delay * 10 * 60 * 1000);

    setInterval(async () => {
      await syncCronjob.executeFindInProcessHasBeenExpired();
    }, this._delay * 5 * 60 * 1000);

    setInterval(async () => {
      await syncCronjob.executeUserHasBeenSynced();
    }, this._delay * 2 * 60 * 1000);
  }
}

module.exports = CronjobApi;
