/**
 * Created by pooya on 5/7/22.
 */

class IFastspringApiRepository {
  /**
   *
   * @param {string} productSerial
   * @return {Promise<(Error|ExternalStoreModel|null)[]>}
   */
  async getProductPrice(productSerial) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { productSerial };
    throw error;
  }

  /**
   *
   * @param {string} subscriptionSerial
   * @return {Promise<(Error|SubscriptionModel|null)[]>}
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
