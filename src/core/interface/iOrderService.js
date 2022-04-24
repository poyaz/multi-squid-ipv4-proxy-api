/**
 * Created by pooya on 4/17/22.
 */

class IOrderService {
  /**
   *
   * @param {string} orderSerial
   * @return {Promise<(Error|OrderModel)[]>}
   */
  getByOrderSerial(orderSerial) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { orderSerial };
    throw error;
  }

  /**
   *
   * @param {string} orderId
   * @return {Promise<(Error|OrderModel)[]>}
   */
  getById(orderId) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { orderId };
    throw error;
  }

  /**
   *
   * @param {string} subscriptionId
   * @return {Promise<(Error|SubscriptionModel)[]>}
   */
  getSubscriptionById(subscriptionId) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { subscriptionId };
    throw error;
  }

  /**
   *
   * @param {string} orderId
   * @return {Promise<(Error|Array<SubscriptionModel>|[])[]>}
   */
  getAllSubscriptionByOrderId(orderId) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { orderId };
    throw error;
  }

  /**
   *
   * @param {OrderModel} filterModel
   * @return {Promise<(Error|Array<OrderModel>|[])[]>}
   */
  getAll(filterModel) {
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
   * @return {Promise<(Error)[]>}
   */
  async update(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }

  /**
   *
   * @param {string} id
   * @return {Promise<(Error)[]>}
   */
  async delete(id) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { id };
    throw error;
  }

  /**
   *
   * @param {string} orderId
   * @param {string} subscriptionId
   * @return {Promise<(Error)[]>}
   */
  async deleteSubscription(orderId, subscriptionId) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { orderId, subscriptionId };
    throw error;
  }
}

module.exports = IOrderService;
