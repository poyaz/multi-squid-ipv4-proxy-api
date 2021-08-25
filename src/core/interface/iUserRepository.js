/**
 * Created by pooya on 8/23/21.
 */

class IUserRepository {
  /**
   *
   * @param {UserModel} filterModel
   * @return {Promise<(Error|Array<UserModel>)[]>}
   */
  async getAll(filterModel) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { filterModel };
    throw error;
  }

  /**
   *
   * @param {string} username
   * @return {Promise<(Error|boolean)[]>}
   */
  async isUserExist(username) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { username };
    throw error;
  }

  /**
   *
   * @param {UserModel} model
   * @return {Promise<(Error|UserModel)[]>}
   */
  async add(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }
}

module.exports = IUserRepository;
