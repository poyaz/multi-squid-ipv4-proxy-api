/**
 * Created by pooya on 8/25/21.
 */

class IPackageRepository {
  /**
   *
   * @param {string} id
   * @param {boolean=false} isFetchDelete
   * @return {Promise<(Error|PackageModel|null)[]>}
   */
  async getById(id, isFetchDelete = false) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { id, isFetchDelete };
    throw error;
  }

  /**
   *
   * @param {string} username
   * @param {PackageModel} filterModel
   * @return {Promise<(Error|Array<PackageModel>|[])[]>}
   */
  async getAllByUsername(username, filterModel) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { username, filterModel };
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
   * @param {string} userId
   * @param {string} proxyType
   * @param {string} proxyCountry
   * @return {Promise<(Error|number|number)[]>}
   */
  async countOfIpExist(userId, proxyType, proxyCountry) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { userId, proxyType, proxyCountry };
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
