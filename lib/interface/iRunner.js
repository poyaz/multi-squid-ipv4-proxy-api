/**
 * Created by pooya on 11/19/20.
 */

class IRunner {
  /**
   *
   * @return {Promise<*>}
   */
  async start() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
    throw error;
  }
}

module.exports = IRunner;
