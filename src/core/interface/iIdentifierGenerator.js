/**
 * Created by pooya on 8/23/21.
 */

class IIdentifierGenerator {
  /**
   * @return {string}
   */
  generateId() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
    throw error;
  }
}

module.exports = IIdentifierGenerator;
