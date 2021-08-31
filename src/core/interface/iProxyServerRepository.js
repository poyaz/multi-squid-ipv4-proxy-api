/**
 * Created by pooya on 8/26/21.
 */

class IProxyServerRepository {
  /**
   *
   * @return {Promise<(Error|Array<IpAddressModel>)[]>}
   */
  async getAll() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
    throw error;
  }

  /**
   *
   * @param {string} ipWithMask
   * @return {Promise<(Error|Array<IpAddressModel>)[]>}
   */
  async getByIpMask(ipWithMask) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { ipWithMask };
    throw error;
  }

  /**
   *
   * @param {Array<IpAddressModel>} models
   * @return {Promise<(Error|Array<IpAddressModel>)[]>}
   */
  async add(models) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { models };
    throw error;
  }

  /**
   *
   * @param {string} ipWithMask
   * @return {Promise<(Error)[]>}
   */
  async activeIpMask(ipWithMask) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { ipWithMask };
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
