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
  async generate(model, serverModel) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model, serverModel };
    throw error;
  }
}

module.exports = IServerApiRepository;
