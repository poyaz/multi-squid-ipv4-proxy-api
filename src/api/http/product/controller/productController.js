/**
 * Created by pooya on 4/17/22.
 */

const GetAllProductOutputModel = require('./model/getAllProductOutputModel');
const GetAllEnableProductOutputModel = require('./model/getAllEnableProductOutputModel');
const AddProductInputModel = require('./model/addProductInputModel');
const AddProductOutputModel = require('./model/addProductOutputModel');
const UpdateProductInputModel = require('./model/updateProductInputModel');

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
    const { body } = this.#req;

    const addProductInputModel = new AddProductInputModel();
    const model = addProductInputModel.getModel(body);

    const [error, data] = await this.#productService.add(model);
    if (error) {
      return [error];
    }

    const addProductOutputModel = new AddProductOutputModel(this.#dateTime);
    const result = addProductOutputModel.getOutput(data);

    return [null, result];
  }

  async disableProduct() {
    const { id } = this.#req.params;

    const [error] = await this.#productService.disableById(id);
    if (error) {
      return [error];
    }

    return [null];
  }

  async enableProduct() {
    const { id } = this.#req.params;

    const [error] = await this.#productService.enableById(id);
    if (error) {
      return [error];
    }

    return [null];
  }

  async updateProduct() {
    const { id } = this.#req.params;
    const { body } = this.#req;

    const updateProductInputModel = new UpdateProductInputModel(id);
    const model = updateProductInputModel.getModel(body);

    const [error] = await this.#productService.update(model);
    if (error) {
      return [error];
    }

    return [null];
  }

  async deleteProduct() {
    const { id } = this.#req.params;

    const [error] = await this.#productService.delete(id);
    if (error) {
      return [error];
    }

    return [null];
  }
}

module.exports = ProductController;
