/**
 * Created by pooya on 4/17/22.
 */

class IProductRepository {
  /**
   *
   * @param {ProductModel} filterNode
   * @return {Promise<(Error|Array<ProductModel>|[])[]>}
   */
  async getAll(filterNode) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { filterNode };
    throw error;
  }

  /**
   *
   * @param {string} id
   * @return {Promise<(Error|Array<ProductModel>|[])[]>}
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
   * @param {string} id
   * @return {Promise<(Error)[]>}
   */
  async delete(id) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { id };
    throw error;
  }
}

module.exports = IProductRepository;
