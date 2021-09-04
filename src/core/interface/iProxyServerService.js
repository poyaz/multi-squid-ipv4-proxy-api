/**
 * Created by pooya on 8/30/21.
 */

class IProxyServerService {
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
   * @param {IpAddressModel} model
   * @return {Promise<(Error|uuid)[]>}
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

  /**
   *
   * @param {IpAddressModel} model
   * @return {Promise<(Error|uuid)[]>}
   */
  async delete(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }
}

module.exports = IProxyServerService;
