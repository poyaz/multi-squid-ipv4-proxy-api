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
   * @type {IServerService}
   */
  #findClusterServerService;
  /**
   * @type {IDateTime}
   */
  #dateTime;

  /**
   *
   * @param {IServerService} serverService
   * @param {IServerService} findClusterServerService
   * @param {IDateTime} dateTime
   */
  constructor(serverService, findClusterServerService, dateTime) {
    this.#serverService = serverService;
    this.#findClusterServerService = findClusterServerService;
    this.#dateTime = dateTime;
  }

  /**
   *
   * @param req
   * @param res
   * @return {ServerController}
   */
  create(req, res) {
    return new ServerController(
      req,
      res,
      this.#serverService,
      this.#findClusterServerService,
      this.#dateTime,
    );
  }
}

module.exports = ServerControllerFactory;
