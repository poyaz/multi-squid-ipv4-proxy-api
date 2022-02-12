/**
 * Created by pooya on 2/12/22.
 */

const ServerModel = require('~src/core/model/serverModel');

class AddServerInputModel {
  getModel(body) {
    const model = new ServerModel();
    model.name = body.name;
    model.ipRange = body.ipRange;
    model.hostIpAddress = body.hostIpAddress;
    model.hostApiPort = body.hostApiPort;

    return model;
  }
}

module.exports = AddServerInputModel;
