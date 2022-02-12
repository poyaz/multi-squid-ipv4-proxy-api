/**
 * Created by pooya on 2/12/22.
 */

const GetAllServerOutputModel = require('./model/getAllServerOutputModel');
const AddServerInputModel = require('./model/addServerInputModel');
const BaseServerOutputModel = require('./model/baseServerOutputModel');

class ServerController {
  #req;
  #res;
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
   * @param req
   * @param res
   * @param {IServerService} serverService
   * @param {IDateTime} dateTime
   */
  constructor(req, res, serverService, dateTime) {
    this.#req = req;
    this.#res = res;
    this.#serverService = serverService;
    this.#dateTime = dateTime;
  }

  async getAll() {
    const [error, data] = await this.#serverService.getAll();
    if (error) {
      return [error];
    }

    const getAllServerOutputModel = new GetAllServerOutputModel(this.#dateTime);
    const result = getAllServerOutputModel.getOutput(data);

    return [null, result];
  }

  async add() {
    const { body } = this.#req;

    const addServerInputModel = new AddServerInputModel();
    const inputModel = addServerInputModel.getModel(body);

    const [error, data] = await this.#serverService.add(inputModel);
    if (error) {
      return [error];
    }

    const baseServerOutputModel = new BaseServerOutputModel(this.#dateTime);
    const result = baseServerOutputModel.getOutput(data);

    return [null, result];
  }

  async appendIpRange() {
    const { id } = this.#req.params;
    const { ipRange } = this.#req.body;

    const [error] = await this.#serverService.appendIpRangeByServiceId(id, ipRange);
    if (error) {
      return [error];
    }

    return [null];
  }

  async delete() {
    const { id } = this.#req.params;

    const [error] = await this.#serverService.delete(id);
    if (error) {
      return [error];
    }

    return [null];
  }
}

module.exports = ServerController;
