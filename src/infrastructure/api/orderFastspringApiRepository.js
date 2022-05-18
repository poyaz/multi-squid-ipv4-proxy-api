/**
 * Created by pooya on 4/30/22.
 */

const IOrderRepository = require('~src/core/interface/iOrderRepository');

class OrderFastspringApiRepository extends IOrderRepository {
  /**
   * @type {IOrderRepository}
   */
  #orderRepository;
  /**
   * @type {IFastspringApiRepository}
   */
  #fastspringApiRepository;

  constructor(orderRepository, fastspringApiRepository) {
    super();

    this.#orderRepository = orderRepository;
    this.#fastspringApiRepository = fastspringApiRepository;
  }

  async getById(orderId) {
    const [fetchError, fetchData] = await this.#orderRepository.getById(orderId);
    if (fetchError) {
      return [fetchError];
    }
    if (!fetchData || (fetchData && !fetchData.orderSerial)) {
      return [null, fetchData];
    }

    const [fastspringError] = await this.#fastspringApiRepository.getOrder(orderId);
    if (fastspringError) {
      return [fastspringError];
    }

    return [null, fetchData];
  }

  async getAll(filterModel) {
    return this.#orderRepository.getAll(filterModel);
  }

  async getSubscriptionById(subscriptionId) {
    return this.#orderRepository.getSubscriptionById(subscriptionId);
  }

  async getAllSubscriptionByOrderId(orderId) {
    return this.#orderRepository.getAllSubscriptionByOrderId(orderId);
  }

  async add(model) {
    if (model.orderSerial) {
      const [error] = await this._verifyOrderInfo(model);
      if (error) {
        return [error];
      }
    }

    return this.#orderRepository.add(model);
  }

  async addSubscription(model) {
    return this.#orderRepository.addSubscription(model);
  }

  async update(model) {
    if (model.orderSerial || model.status) {
      const [error] = await this._verifyOrderInfo(model);
      if (error) {
        return [error];
      }
    }

    return this.#orderRepository.update(model);
  }

  async _verifyOrderInfo(model) {
    const [error, data] = await this.#fastspringApiRepository.getOrder(model.orderSerial);
    if (error) {
      return [error];
    }

    model.status = data.status;
    model.orderBodyData = data.orderBodyData;

    return [null];
  }
}

module.exports = OrderFastspringApiRepository;
