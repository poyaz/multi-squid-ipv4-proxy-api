/**
 * Created by pooya on 5/24/22.
 */

class ISyncService {
  /**
   *
   * @return {Promise<(Error)[]>}
   */
  async executePackageHasBeenSynced() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
    throw error;
  }

  /**
   *
   * @return {Promise<(Error)[]>}
   */
  async executeOrderHasBeenCanceled() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
    throw error;
  }

  /**
   *
   * @return {Promise<(Error)[]>}
   */
  async executePackageHasBeenExpired() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
    throw error;
  }

  /**
   *
   * @return {Promise<(Error)[]>}
   */
  async executeFindInProcessHasBeenExpired() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
    throw error;
  }
}

module.exports = ISyncService;
