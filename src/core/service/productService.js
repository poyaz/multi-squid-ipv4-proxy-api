/**
 * Created by pooya on 4/17/22.
 */

const IProductService = require('~src/core/interface/iProductService');
const ProductModel = require('~src/core/model/productModel');

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
}

module.exports = ProductService;
