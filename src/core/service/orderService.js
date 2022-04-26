/**
 * Created by pooya on 4/25/22.
 */

const IOrderService = require('~src/core/interface/iOrderService');
const OrderModel = require('~src/core/model/orderModel');
const NotFoundException = require('~src/core/exception/notFoundException');

class OrderService extends IOrderService {
  /**
   * @type {IPackageService}
   */
  #packageService;
  /**
   * @type {IOrderRepository}
   */
  #orderRepository;

  /**
   *
   * @param {IPackageService} packageService
   * @param {IOrderRepository} orderRepository
   */
  constructor(packageService, orderRepository) {
    super();

    this.#packageService = packageService;
    this.#orderRepository = orderRepository;
  }

  async getByOrderSerial(orderSerial) {
    const filterModel = new OrderModel();
    filterModel.orderSerial = orderSerial;

    const [error, result] = await this.#orderRepository.getAll(filterModel);
    if (error) {
      return [error];
    }
    if (result.length === 0) {
      return [new NotFoundException()];
    }

    return [null, result[0]];
  }

  async getById(orderId) {
    const [error, result] = await this.#orderRepository.getById(orderId);
    if (error) {
      return [error];
    }
    if (!result) {
      return [new NotFoundException()];
    }

    return [null, result];
  }

  async getSubscriptionById(subscriptionId) {
    const [error, result] = await this.#orderRepository.getSubscriptionById(subscriptionId);
    if (error) {
      return [error];
    }
    if (!result) {
      return [new NotFoundException()];
    }

    return [null, result];
  }

  async getAllSubscriptionByOrderId(orderId) {
    return this.#orderRepository.getAllSubscriptionByOrderId(orderId);
  }

  async getAll(filterModel) {
    return this.#orderRepository.getAll(filterModel);
  }
}

module.exports = OrderService;
