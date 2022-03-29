/**
 * Created by pooya on 2/12/22.
 */

class GetAllInterfaceOutputModel {
  /**
   *
   * @param {Array<IpInterfaceModel>} models
   * @return {Array<{}>}
   */
  getOutput(models) {
    return models.map((v) => ({
      hostname: v.hostname,
      interfaceName: v.interfaceName,
      interfacePrefix: v.interfacePrefix,
      ipList: v.ipList,
    }));
  }
}

module.exports = GetAllInterfaceOutputModel;
