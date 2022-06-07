/**
 * Created by pooya on 5/24/22.
 */

class ISyncRepository {
  /**
   *
   * @return {Promise<(Error|Array<SyncModel>|[])[]>}
   */
  async getListOfPackageNotSynced() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
    throw error;
  }

  /**
   *
   * @return {Promise<(Error|Array<SyncModel>|[])[]>}
   */
  async getListOfOrderNotCanceled() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
    throw error;
  }

  /**
   *
   * @return {Promise<(Error|Array<SyncModel>|[])[]>}
   */
  async getListOfPackageNotExpired() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
    throw error;
  }

  /**
   *
   * @param {Date} expireDate
   * @return {Promise<(Error|Array<SyncModel>|[])[]>}
   */
  async getListOfInProcessExpired(expireDate) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { expireDate };
    throw error;
  }

  /**
   *
   * @param {SyncModel} model
   * @return {Promise<(Error|SyncModel)[]>}
   */
  async add(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }

  /**
   *
   * @param {SyncModel} model
   * @return {Promise<(Error)[]>}
   */
  async update(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }
}

module.exports = ISyncRepository;
