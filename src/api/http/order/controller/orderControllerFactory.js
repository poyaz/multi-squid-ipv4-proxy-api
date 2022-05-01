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
   * @type {IOrderParserService}
   */
  #fastspringOrderParse;
  /**
   * @type {IDateTime}
   */
  #dateTime;

  /**
   *
   * @param {IOrderService} orderService
   * @param {IOrderParserService} fastspringOrderParse
   * @param {IDateTime} dateTime
   */
  constructor(orderService, fastspringOrderParse, dateTime) {
    this.#orderService = orderService;
    this.#fastspringOrderParse = fastspringOrderParse;
    this.#dateTime = dateTime;
  }

  /**
   *
   * @param req
   * @param res
   * @return {OrderController}
   */
  create(req, res) {
    return new OrderController(
      req,
      res,
      this.#orderService,
      this.#fastspringOrderParse,
      this.#dateTime,
    );
  }
}

module.exports = OrderControllerFactory;
