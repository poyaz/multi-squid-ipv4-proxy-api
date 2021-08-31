/**
 * Created by pooya on 8/30/21.
 */

class IJobService {
  /**
   *
   * @param {uuid} id
   * @return {Promise<(Error|JobModel)[]>}
   */
  async getById(id) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { id };
    throw error;
  }

  /**
   *
   * @param {JobModel} model
   * @return {Promise<(Error|JobModel)[]>}
   */
  async add(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }

  /**
   *
   * @param {JobModel} model
   * @return {void}
   */
  async execute(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }
}

module.exports = IJobService;
