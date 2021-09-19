/**
 * Created by pooya on 8/23/21.
 */

class IPackageService {
  /**
   *
   * @param {PackageModel} model
   * @return {Promise<(Error|PackageModel|[])[]>}
   */
  async add(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }

  /**
   *
   * @param {string} username
   * @return {Promise<(Error|Array<PackageModel>|[])[]>}
   */
  async getAllByUsername(username) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { username };
    throw error;
  }

  /**
   *
   * @param {uuid} id
   * @param {Date} expireDate
   * @return {Promise<(Error)[]>}
   */
  async renew(id, expireDate) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { id, expireDate };
    throw error;
  }

  /**
   *
   * @return {Promise<(Error)[]>}
   */
  async disableExpirePackage() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
    throw error;
  }

  /**
   *
   * @param {uuid} id
   * @return {Promise<(Error)[]>}
   */
  async remove(id) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { id };
    throw error;
  }
}

module.exports = IPackageService;
