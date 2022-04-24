/**
 * Created by pooya on 3/13/22.
 */

const OrderController = require('./orderController');

class OrderControllerFactory {
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
   * @param {IOrderService} orderService
   * @param {IDateTime} dateTime
   */
  constructor(orderService, dateTime) {
    this.#orderService = orderService;
    this.#dateTime = dateTime;
  }

  /**
   *
   * @param req
   * @param res
   * @return {OrderController}
   */
  create(req, res) {
    return new OrderController(req, res, this.#orderService, this.#dateTime);
  }
}

module.exports = OrderControllerFactory;
