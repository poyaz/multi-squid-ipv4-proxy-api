/**
 * Created by pooya on 8/23/21.
 */

class IUrlAccessService {
  /**
   *
   * @param {UrlAccessModel} model
   * @return {Promise<(Error|UrlAccessModel|[])[]>}
   */
  async add(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }
}

module.exports = IUrlAccessService;
