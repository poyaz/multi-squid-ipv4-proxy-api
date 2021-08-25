/**
 * Created by pooya on 8/23/21.
 */

class IUserService {
  /**
   *
   * @param {UserModel} model
   * @return {Promise<(Error|UserModel|[])[]>}
   */
  async add(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }

  /**
   *
   * @param {UserModel} filterModel
   * @return {Promise<(Error|Array<UserModel>|[])[]>}
   */
  async getAll(filterModel) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { filterModel };
    throw error;
  }

  /**
   *
   * @param {string} username
   * @param {string} password
   * @return {Promise<void>}
   */
  async changePassword(username, password) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { username, password };
    throw error;
  }
}

module.exports = IUserService;
