/**
 * Created by pooya on 8/29/21.
 */

/**
 *
 * @property {uuid} id
 * @package {string} ip
 * @package {number} port
 * @package {number} mask
 * @package {string} gateway
 * @package {Date} interface
 * @package {Date} updateDate
 * @package {Date} deleteDate
 */
class IpAddressModel {
  id = undefined;
  ip = undefined;
  port = undefined;
  mask = undefined;
  gateway = undefined;
  interface = undefined;
  insertDate = undefined;
  updateDate = undefined;
  deleteDate = undefined;
}

module.exports = IpAddressModel;
