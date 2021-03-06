/**
 * Created by pooya on 8/30/21.
 */

const IpAddressModel = require('~src/core/model/ipAddressModel');

class DeleteProxyIpInputModel {
  getModel(body) {
    const model = new IpAddressModel();
    model.ip = body.ip;
    model.port = 3128;
    model.mask = body.mask;
    model.gateway = body.gateway;
    model.interface = body.interface;

    return model;
  }
}

module.exports = DeleteProxyIpInputModel;
