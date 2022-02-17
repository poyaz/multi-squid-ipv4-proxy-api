/**
 * Created by pooya on 2/14/22.
 */

class IServerApiRepository {
  /**
   *
   * @param {IpAddressModel} model
   * @param {ServerModel} serverModel
   * @return {Promise<(Error|JobModel)[]>}
   */
  async generateIp(model, serverModel) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model, serverModel };
    throw error;
  }

  /**
   *
   * @param {IpAddressModel} model
   * @param {ServerModel} serverModel
   * @return {Promise<(Error|JobModel)[]>}
   */
  async deleteIp(model, serverModel) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model, serverModel };
    throw error;
  }

  /**
   *
   * @param {string} username
   * @param {ServerModel} serverModel
   * @return {Promise<(Error|PackageModel)[]>}
   */
  async getAllPackageByUsername(username, serverModel) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { username, serverModel };
    throw error;
  }
}

module.exports = IServerApiRepository;
