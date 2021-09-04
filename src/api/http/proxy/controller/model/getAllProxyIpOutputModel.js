/**
 * Created by pooya on 8/25/21.
 */

const BaseProxyIpOutputModel = require('./baseProxyIpOutputModel');

class GetAllProxyIpOutputModel {
  /**
   * @type {IDateTime}
   */
  #dateTime;

  /**
   *
   * @param {IDateTime} dateTime
   */
  constructor(dateTime) {
    this.#dateTime = dateTime;
  }

  /**
   *
   * @param {Array<IpAddressModel>} models
   * @return {Array<{}>}
   */
  getOutput(models) {
    const baseUserOutputModel = new BaseProxyIpOutputModel(this.#dateTime);

    return models.map((v) => baseUserOutputModel.getOutput(v));
  }
}

module.exports = GetAllProxyIpOutputModel;
