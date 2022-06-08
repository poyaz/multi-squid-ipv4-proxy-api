/**
 * Created by pooya on 6/7/22.
 */

class SyncCronjob {
  /**
   * @type {ISyncService}
   */
  #syncService;

  /**
   *
   * @param {ISyncService} syncService
   */
  constructor(syncService) {
    this.#syncService = syncService;
  }

  async executePackageHasBeenSynced() {
    try {
      const [error] = await this.#syncService.executePackageHasBeenSynced();
      if (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async executeOrderHasBeenCanceled() {
    try {
      const [error] = await this.#syncService.executeOrderHasBeenCanceled();
      if (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async executePackageHasBeenExpired() {
    try {
      const [error] = await this.#syncService.executePackageHasBeenExpired();
      if (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async executeFindInProcessHasBeenExpired() {
    try {
      const [error] = await this.#syncService.executeFindInProcessHasBeenExpired();
      if (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async executeUserHasBeenSynced() {
    try {
      const [error] = await this.#syncService.executeUserHasBeenSynced();
      if (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = SyncCronjob;
