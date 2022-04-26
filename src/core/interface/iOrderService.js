/**
 * Created by pooya on 4/17/22.
 */

class IOrderService {
  /**
   *
   * @param {string} orderSerial
   * @return {Promise<(Error|OrderModel)[]>}
   */
  async getByOrderSerial(orderSerial) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { orderSerial };
    throw error;
  }

  /**
   *
   * @param {string} orderId
   * @return {Promise<(Error|OrderModel)[]>}
   */
  async getById(orderId) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { orderId };
    throw error;
  }

  /**
   *
   * @param {string} subscriptionId
   * @return {Promise<(Error|SubscriptionModel)[]>}
   */
  async getSubscriptionById(subscriptionId) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { subscriptionId };
    throw error;
  }

  /**
   *
   * @param {string} orderId
   * @return {Promise<(Error|Array<SubscriptionModel>|[])[]>}
   */
  async getAllSubscriptionByOrderId(orderId) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { orderId };
    throw error;
  }

  /**
   *
   * @param {OrderModel} filterModel
   * @return {Promise<(Error|Array<OrderModel>|[])[]>}
   */
  async getAll(filterModel) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { filterModel };
    throw error;
  }

  /**
   *
   * @param {OrderModel} model
   * @return {Promise<(Error|OrderModel)[]>}
   */
  async add(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }

  /**
   *
   * @param {SubscriptionModel} model
   * @return {Promise<(Error|SubscriptionModel)[]>}
   */
  async addSubscription(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }

  /**
   *
   * @param {OrderModel} model
   * @return {Promise<(Error|PackageModel|[])[]>}
   */
  async verifyOrderPackage(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }
}

module.exports = IOrderService;
