/**
 * Created by pooya on 4/17/22.
 */

class IProductRepository {
  /**
   *
   * @param {ProductModel} filterModel
   * @return {Promise<(Error|Array<ProductModel>|[])[]>}
   */
  async getAll(filterModel) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { filterModel };
    throw error;
  }

  /**
   *
   * @param {string} id
   * @return {Promise<(Error|ProductModel|null)[]>}
   */
  async getById(id) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { id };
    throw error;
  }

  /**
   *
   * @param {ProductModel} model
   * @return {Promise<(Error|ProductModel)[]>}
   */
  async add(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }

  /**
   *
   * @param {ProductModel} model
   * @return {Promise<(Error)[]>}
   */
  async update(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }

  /**
   *
   * @param {ExternalStoreModel} model
   * @return {Promise<(Error)[]>}
   */
  async updateExternalStore(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }

  /**
   *
   * @param {string} id
   * @return {Promise<(Error)[]>}
   */
  async delete(id) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { id };
    throw error;
  }

  /**
   *
   * @param {string} productId
   * @param {string} externalStoreId
   * @return {Promise<(Error)[]>}
   */
  async deleteExternalStore(productId, externalStoreId) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { productId, externalStoreId };
    throw error;
  }
}

module.exports = IProductRepository;
