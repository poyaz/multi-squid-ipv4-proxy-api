/**
 * Created by pooya on 4/25/22.
 */

class IOrderRepository {
  /**
   *
   * @param {string} orderId
   * @return {Promise<(Error|OrderModel|null)[]>}
   */
  async getById(orderId) {
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
   * @param {OrderModel} model
   * @return {Promise<(Error|OrderModel|[])[]>}
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
   * @return {Promise<(Error)[]>}
   */
  async update(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }
}

module.exports = IOrderRepository;
