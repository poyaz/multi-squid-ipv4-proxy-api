/**
 * Created by pooya on 8/26/21.
 */

class IProxyServerRepository {
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
