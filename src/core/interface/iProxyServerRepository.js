/**
 * Created by pooya on 8/26/21.
 */

class IProxyServerRepository {
  /**
   *
   * @param {Array<IpAddressModel>} model
   * @return {Promise<(Error|IpAddressModel)[]>}
   */
  async add(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }

  /**
   *
   * @return {Promise<(Error)[]>}
   */
  async init() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
    throw error;
  }

  /**
   *
   * @return {Promise<(Error)[]>}
   */
  async reload() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
    throw error;
  }
}

module.exports = IProxyServerRepository;
