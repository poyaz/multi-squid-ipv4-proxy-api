/**
 * Created by pooya on 3/13/22.
 */

class IExternalAuthService {
  /**
   *
   * @param {string} platform
   * @return {Promise<(Error|Array<OauthModel>)[]>}
   */
  async getOptions(platform) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { platform };
    throw error;
  }

  /**
   *
   * @param {string} platform
   * @return {Promise<(Error|string)[]>}
   */
  async auth(platform) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { platform };
    throw error;
  }

  /**
   *
   * @param {string} platform
   * @param {string} code
   * @return {Promise<(Error|UserModel)[]>}
   */
  async verify(platform, code) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { platform, code };
    throw error;
  }
}

module.exports = IExternalAuthService;
