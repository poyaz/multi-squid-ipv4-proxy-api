/**
 * Created by pooya on 5/7/22.
 */

class IFastspringApiRepository {
  /**
   *
   * @param {string} subscriptionSerial
   * @return {Promise<(Error)[]>}
   */
  async getSubscription(subscriptionSerial) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { subscriptionSerial };
    throw error;
  }

  /**
   *
   * @param {string} subscriptionSerial
   * @return {Promise<(Error)[]>}
   */
  async cancelSubscription(subscriptionSerial) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { subscriptionSerial };
    throw error;
  }
}

module.exports = IFastspringApiRepository;