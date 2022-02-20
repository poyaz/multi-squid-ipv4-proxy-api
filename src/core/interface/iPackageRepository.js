/**
 * Created by pooya on 8/25/21.
 */

class IPackageRepository {
  /**
   *
   * @param {string} id
   * @return {Promise<(Error|PackageModel|null)[]>}
   */
  async getById(id) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { id };
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
   * @return {Promise<(Error|Array<PackageModel>|[])[]>}
   */
  async getAllExpirePackage() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
    throw error;
  }

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
   * @param {PackageModel} model
   * @return {Promise<(Error|number)[]>}
   */
  async update(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }
}

module.exports = IPackageRepository;
