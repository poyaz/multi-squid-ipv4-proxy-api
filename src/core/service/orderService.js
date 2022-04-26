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
}

module.exports = OrderService;
