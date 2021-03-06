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
 * @package {string} type
 * @package {string} country
 * @package {Date} insertDate
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
  type = undefined;
  country = undefined;
  insertDate = undefined;
  updateDate = undefined;
  deleteDate = undefined;

  clone() {
    return Object.assign(Object.create(this), this);
  }
}

module.exports = IpAddressModel;
