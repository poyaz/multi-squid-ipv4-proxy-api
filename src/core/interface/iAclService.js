/**
 * Created by pooya on 8/30/21.
 */

class IAclService {
  /**
   *
   * @param {Object} userData
   * @param {string} userData.id
   * @param {string} userData.username
   * @param {string} userData.role
   * @param {Object} params
   * @param {string} params.userId
   * @param {string} params.orderId
   * @param {string} params.packageId
   * @param {string} params.username
   * @return {Promise<(Error)[]>}
   */
  async isAccessToUrl(userData, params) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { userData, params };
    throw error;
  }
}

module.exports = IAclService;
