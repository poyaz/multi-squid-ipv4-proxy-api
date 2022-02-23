/**
 * Created by pooya on 2/12/22.
 */

const ServerModel = require('~src/core/model/serverModel');

class UpdateServerInputModel {
  getModel(id, body) {
    const model = new ServerModel();
    model.id = id;
    model.name = body.name;
    model.ipRange = body.ipRange;
    model.hostIpAddress = body.hostIpAddress;
    model.internalHostIpAddress = body.internalHostIpAddress;
    model.hostApiPort = body.hostApiPort;
    model.isEnable = body.isEnable;

    return model;
  }
}

module.exports = UpdateServerInputModel;
