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

  async getById(productId) {
    const [error, result] = await this.#productRepository.getById(productId);
    if (error) {
      return [error];
    }
    if (!result) {
      return [new NotFoundException()];
    }

    return [null, result];
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

  async updateExternalStore(model) {
    const [fetchError, fetchData] = await this._getProductById(model.productId);
    if (fetchError) {
      return [fetchError];
    }

    const findIndex = fetchData.externalStore.findIndex((v) => v.id === model.id);
    if (findIndex === -1) {
      return [new NotFoundException()];
    }

    return this.#productRepository.updateExternalStore(model);
  }

  async delete(id) {
    const [fetchError] = await this._getProductById(id);
    if (fetchError) {
      return [fetchError];
    }

    return this.#productRepository.delete(id);
  }

  async deleteExternalStore(productId, externalStoreId) {
    const [fetchError, fetchData] = await this._getProductById(productId);
    if (fetchError) {
      return [fetchError];
    }

    const findIndex = fetchData.externalStore.findIndex((v) => v.id === externalStoreId);
    if (findIndex === -1) {
      return [new NotFoundException()];
    }

    return this.#productRepository.deleteExternalStore(productId, externalStoreId);
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
