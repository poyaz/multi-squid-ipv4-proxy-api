/**
 * Created by pooya on 8/23/21.
 */

class IUrlAccessService {
  /**
   *
   * @param {UrlAccessModel} model
   * @return {Promise<(Error|UrlAccessModel)[]>}
   */
  async add(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }

  /**
   *
   * @param {string} username
   * @param {string} url
   * @return {Promise<(Error|boolean)[]>}
   */
  async checkBlockUrlForUsername(username, url) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { username, url };
    throw error;
  }
}

module.exports = IUrlAccessService;
