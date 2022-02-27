/**
 * Created by pooya on 2/12/22.
 */

const ServerController = require('./serverController');

class ServerControllerFactory {
  /**
   * @type {IServerService}
   */
  #serverService;
  /**
   * @type {IDateTime}
   */
  #dateTime;

  /**
   *
   * @param {IServerService} serverService
   * @param {IDateTime} dateTime
   */
  constructor(serverService, dateTime) {
    this.#serverService = serverService;
    this.#dateTime = dateTime;
  }

  /**
   *
   * @param req
   * @param res
   * @return {ServerController}
   */
  create(req, res) {
    return new ServerController(req, res, this.#serverService, this.#dateTime);
  }
}

module.exports = ServerControllerFactory;
