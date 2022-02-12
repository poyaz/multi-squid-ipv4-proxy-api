/**
 * Created by pooya on 8/30/21.
 */

class IServerService {
  /**
   *
   * @return {Promise<(Error|Array<ServerModel>)[]>}
   */
  async getAll() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
    throw error;
  }

  /**
   *
   * @param {ServerModel} model
   * @return {Promise<(Error|ServerModel)[]>}
   */
  async add(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }

  /**
   *
   * @param {string} id
   * @param {Array<string>} range
   * @return {Promise<(Error)[]>}
   */
  async appendIpRangeByServiceId(id, range) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { id, range };
    throw error;
  }

  /**
   *
   * @param {ServerModel} id
   * @return {Promise<(Error)[]>}
   */
  async delete(id) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { id };
    throw error;
  }
}

module.exports = IServerService;
