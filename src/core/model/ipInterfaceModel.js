/**
 * Created by pooya on 3/29/22.
 */

/**
 *
 * @property {string} hostname - Server hostname
 * @property {string} interfaceName - Interface name
 * @property {string} interfacePrefix - Prefix of interface name
 * @ipList {Array<String>} - List of interface ip address
 */
class IpInterfaceModel {
  hostname = undefined;
  interfaceName = undefined;
  interfacePrefix = undefined;
  ipList = [];
}

module.exports = IpInterfaceModel;
