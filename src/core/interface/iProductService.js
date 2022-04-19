/**
 * Created by pooya on 4/17/22.
 */

class IProductService {
  /**
   *
   * @return {Promise<(Error|Array<ProductModel>|[])[]>}
   */
  async getAll() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
    throw error;
  }

  /**
   *
   * @return {Promise<(Error|Array<ProductModel>|[])[]>}
   */
  async getAllEnable() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
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
   * @param {string} id
   * @return {Promise<(Error)[]>}
   */
  async disableById(id) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { id };
    throw error;
  }

  /**
   *
   * @param {string} id
   * @return {Promise<(Error)[]>}
   */
  async enableById(id) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { id };
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
}

module.exports = IProductService;
