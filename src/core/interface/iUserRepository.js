/**
 * Created by pooya on 8/23/21.
 */

class IUserRepository {
  /**
   *
   * @param {string} username
   * @return {Promise<(Error|boolean)[]>}
   */
  isUserExist(username) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { username };
    throw error;
  }

  /**
   *
   * @param {UserModel} model
   * @return {Promise<(Error|UserModel)[]>}
   */
  add(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }
}

module.exports = IUserRepository;
