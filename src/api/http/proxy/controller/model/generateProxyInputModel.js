/**
 * Created by pooya on 8/30/21.
 */

const IpAddressModel = require('~src/core/model/ipAddressModel');

class GenerateProxyInputModel {
  getModel(body) {
    const model = new IpAddressModel();
    model.ip = body.ip;
    model.port = 3128;
    model.mask = body.mask;
    model.gateway = body.gateway;
    model.interface = body.interface;
    model.type = body.type;
    model.country = body.country.toUpperCase();

    return model;
  }
}

module.exports = GenerateProxyInputModel;
