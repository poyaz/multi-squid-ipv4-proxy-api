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
   * @param {UserModel} model
   * @return {Promise<(Error|UserModel|[])[]>}
   */
  async addAdmin(model) {
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
   * @param {UserModel} userId
   * @return {Promise<(Error|UserModel)[]>}
   */
  async getUserById(userId) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { userId };
    throw error;
  }

  /**
   *
   * @param {string} username
   * @param {string} password
   * @return {Promise<(Error|UserModel)[]>}
   */
  async checkUsernameAndPassword(username, password) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { username, password };
    throw error;
  }

  /**
   *
   * @param {string} username
   * @param {string} password
   * @return {Promise<(Error)[]>}
   */
  async changePassword(username, password) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { username, password };
    throw error;
  }

  /**
   *
   * @param {string} username
   * @return {Promise<(Error)[]>}
   */
  async disableByUsername(username) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { username };
    throw error;
  }

  /**
   *
   * @param {string} username
   * @return {Promise<(Error)[]>}
   */
  async enableByUsername(username) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { username };
    throw error;
  }

  /**
   *
   * @param {UserModel} model
   * @return {Promise<(Error)[]>}
   */
  async update(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }
}

module.exports = IUserService;
