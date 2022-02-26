/**
 * Created by pooya on 2/12/22.
 */

/**
 *
 * @property {string} id
 * @property {string} name
 * @property {Array<string>} ipRange
 * @property {string} hostIpAddress
 * @property {string} internalHostIpAddress
 * @property {number} hostApiPort
 * @property {boolean} isEnable
 * @property {Date} insertDate
 */
class ServerModel {
  id = undefined;
  name = undefined;
  ipRange = undefined;
  hostIpAddress = undefined;
  internalHostIpAddress = undefined;
  hostApiPort = undefined;
  isEnable = undefined;
  insertDate = undefined;
}

module.exports = ServerModel;
