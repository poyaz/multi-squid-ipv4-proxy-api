/**
 * Created by pooya on 4/17/22.
 */

const GetAllProductOutputModel = require('./model/getAllProductOutputModel');
const GetAllEnableProductOutputModel = require('./model/getAllEnableProductOutputModel');

class ProductController {
  #req;
  #res;
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
   * @param req
   * @param res
   * @param {IProductService} productService
   * @param {IDateTime} dateTime
   */
  constructor(req, res, productService, dateTime) {
    this.#req = req;
    this.#res = res;
    this.#productService = productService;
    this.#dateTime = dateTime;
  }

  async getAllProduct() {
    const [error, data] = await this.#productService.getAll();
    if (error) {
      return [error];
    }

    const getAllProductOutputModel = new GetAllProductOutputModel(this.#dateTime);
    const result = getAllProductOutputModel.getOutput(data);

    return [null, result];
  }

  async getAllEnableProduct() {
    const [error, data] = await this.#productService.getAllEnable();
    if (error) {
      return [error];
    }

    const getAllEnableProductOutputModel = new GetAllEnableProductOutputModel(this.#dateTime);
    const result = getAllEnableProductOutputModel.getOutput(data);

    return [null, result];
  }

  async addProduct() {

  }
}

module.exports = ProductController;
