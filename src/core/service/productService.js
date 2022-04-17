/**
 * Created by pooya on 4/17/22.
 */

const IProductService = require('~src/core/interface/iProductService');
const ProductModel = require('~src/core/model/productModel');
const NotFoundException = require('~src/core/exception/notFoundException');

class ProductService extends IProductService {
  /**
   * @type {IProductRepository}
   */
  #productRepository;

  /**
   *
   * @param {IProductRepository} productRepository
   */
  constructor(productRepository) {
    super();

    this.#productRepository = productRepository;
  }

  async getAll() {
    const filterModel = new ProductModel();

    return this.#productRepository.getAll(filterModel);
  }

  async getAllEnable() {
    const filterModel = new ProductModel();
    filterModel.isEnable = true;

    return this.#productRepository.getAll(filterModel);
  }

  async add(model) {
    return this.#productRepository.add(model);
  }

  async disableById(id) {
    const [fetchError] = await this._getProductById(id);
    if (fetchError) {
      return [fetchError];
    }

    const disableProductModel = new ProductModel();
    disableProductModel.id = id;
    disableProductModel.isEnable = false;

    return this.#productRepository.update(disableProductModel);
  }

  async enableById(id) {
    const [fetchError] = await this._getProductById(id);
    if (fetchError) {
      return [fetchError];
    }

    const disableProductModel = new ProductModel();
    disableProductModel.id = id;
    disableProductModel.isEnable = true;

    return this.#productRepository.update(disableProductModel);
  }

  async update(model) {
    const [fetchError] = await this._getProductById(model.id);
    if (fetchError) {
      return [fetchError];
    }

    return this.#productRepository.update(model);
  }

  async _getProductById(id) {
    const [fetchError, fetchData] = await this.#productRepository.getById(id);
    if (fetchError) {
      return [fetchError];
    }
    if (!fetchData) {
      return [new NotFoundException()];
    }

    return [null, fetchData];
  }
}

module.exports = ProductService;
