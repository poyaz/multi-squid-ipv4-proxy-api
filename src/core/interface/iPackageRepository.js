/**
 * Created by pooya on 8/25/21.
 */

class IPackageRepository {
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
}

module.exports = IPackageRepository;
