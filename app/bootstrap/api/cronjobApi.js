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
    const syncCronjob = this._dependency.syncCronjob;

    setInterval(async () => {
      await packageCronjob.disableExpirePackage();
    }, 10 * 60 * 1000);

    setInterval(async () => {
      await reloadCronjob.reload();
    }, 20 * 60 * 1000);

    setInterval(async () => {
      await syncCronjob.executePackageHasBeenSynced();
    }, 2 * 60 * 1000);

    setInterval(async () => {
      await syncCronjob.executeOrderHasBeenCanceled();
    }, 10 * 60 * 1000);

    setInterval(async () => {
      await syncCronjob.executePackageHasBeenExpired();
    }, 10 * 60 * 1000);

    setInterval(async () => {
      await syncCronjob.executeFindInProcessHasBeenExpired();
    }, 5 * 60 * 1000);

    setInterval(async () => {
      await syncCronjob.executeUserHasBeenSynced();
    }, 2 * 60 * 1000);
  }
}

module.exports = CronjobApi;
