/**
 * Created by pooya on 3/13/22.
 */

const GetOptionsOutputModel = require('./model/getOptionsOutputModel');

class OauthController {
  #req;
  #res;
  /**
   * @type {IExternalAuthService}
   */
  #externalAuthService;
  /**
   * @type {IDateTime}
   */
  #dateTime;

  /**
   *
   * @param req
   * @param res
   * @param {IExternalAuthService} externalAuthService
   * @param {IDateTime} dateTime
   */
  constructor(req, res, externalAuthService, dateTime) {
    this.#req = req;
    this.#res = res;
    this.#externalAuthService = externalAuthService;
    this.#dateTime = dateTime;
  }

  async getOptions() {
    const { platform } = this.#req.params;

    const [error, data] = await this.#externalAuthService.getOptions(platform);
    if (error) {
      return [error];
    }

    const getOptionsOutputModel = new GetOptionsOutputModel();
    const result = getOptionsOutputModel.getOutput(data);

    return [null, result];
  }

  async auth() {
    const { platform } = this.#req.params;

    const [error, data] = await this.#externalAuthService.auth(platform);
    if (error) {
      return [error];
    }

    return [null, data];
  }
}

module.exports = OauthController;
