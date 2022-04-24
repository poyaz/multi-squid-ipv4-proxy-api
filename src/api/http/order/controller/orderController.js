/**
 * Created by pooya on 4/24/22.
 */

const OrderModel = require('~src/core/model/orderModel');
const GetAllOrderOutputModel = require('~src/api/http/order/controller/model/getAllOrderOutputModel');
const GetAllSubscriptionOfOrderOutputModel = require('~src/api/http/order/controller/model/getAllSubscriptionOfOrderOutputModel');

class OrderController {
  #req;
  #res;
  /**
   * @type {IOrderService}
   */
  #orderService;
  /**
   * @type {IDateTime}
   */
  #dateTime;

  /**
   *
   * @param req
   * @param res
   * @param {IOrderService} orderService
   * @param {IDateTime} dateTime
   */
  constructor(req, res, orderService, dateTime) {
    this.#req = req;
    this.#res = res;
    this.#orderService = orderService;
    this.#dateTime = dateTime;
  }

  async getAllOrderForAdmin() {
    const filterModel = new OrderModel();

    const [error, data] = await this.#orderService.getAll(filterModel);
    if (error) {
      return [error];
    }

    const getAllOrderOutputModel = new GetAllOrderOutputModel(this.#dateTime);
    const result = getAllOrderOutputModel.getOutput(data);

    return [null, result];
  }

  async getAllOrderForUser() {
    const { userId } = this.#req.params;

    const filterModel = new OrderModel();
    filterModel.userId = userId;

    const [error, data] = await this.#orderService.getAll(filterModel);
    if (error) {
      return [error];
    }

    const getAllOrderOutputModel = new GetAllOrderOutputModel(this.#dateTime);
    const result = getAllOrderOutputModel.getOutput(data);

    return [null, result];
  }

  async getAllSubscriptionOfOrder() {
    const { orderId } = this.#req.params;

    const [error, data] = await this.#orderService.getAllSubscriptionByOrderId(orderId);
    if (error) {
      return [error];
    }

    const getAllSubscriptionOfOrderOutputModel = new GetAllSubscriptionOfOrderOutputModel(
      this.#dateTime,
    );
    const result = getAllSubscriptionOfOrderOutputModel.getOutput(data);

    return [null, result];
  }
}

module.exports = OrderController;
