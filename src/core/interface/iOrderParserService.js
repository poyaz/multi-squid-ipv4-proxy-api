/**
 * Created by pooya on 5/1/22.
 */

class IOrderParserService {
  /**
   *
   * @param {string} serviceName
   * @param {Object} data
   * @return {Promise<(Error)[]>}
   */
  async parse(serviceName, data) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { serviceName, data };
    throw error;
  }
}

module.exports = IOrderParserService;
