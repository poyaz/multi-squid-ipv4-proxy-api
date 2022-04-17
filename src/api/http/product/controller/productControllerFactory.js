/**
 * Created by pooya on 4/17/22.
 */

const ProductController = require('./productController');

class ProductControllerFactory {
  /**
   * @type {IProductService}
   */
  #productService;
  /**
   * @type {IDateTime}
   */
  #dateTime;

  /**
   *
   * @param {IProductService} productService
   * @param {IDateTime} dateTime
   */
  constructor(productService, dateTime) {
    this.#productService = productService;
    this.#dateTime = dateTime;
  }

  create(req, res) {
    return new ProductController(req, res, this.#productService, this.#dateTime);
  }
}

module.exports = ProductControllerFactory;
