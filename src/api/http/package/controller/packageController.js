/**
 * Created by pooya on 8/25/21.
 */

const AddPackageInputModel = require('./model/addPackageInputModel');
const AddPackageOutputModel = require('./model/addPackageOutputModel');

class PackageController {
  #req;
  #res;
  /**
   * @type {IPackageService}
   */
  #packageService;
  /**
   * @type {IDateTime}
   */
  #dateTime;

  /**
   *
   * @param req
   * @param res
   * @param {IPackageService} packageService
   * @param {IDateTime} dateTime
   */
  constructor(req, res, packageService, dateTime) {
    this.#req = req;
    this.#res = res;
    this.#packageService = packageService;
    this.#dateTime = dateTime;
  }

  async addPackage() {
    const { body } = this.#req;

    const addPackageInputModel = new AddPackageInputModel(this.#dateTime);
    const model = addPackageInputModel.getModel(body);

    const [error, data] = await this.#packageService.add(model);
    if (error) {
      return [error];
    }

    const addPackageOutputModel = new AddPackageOutputModel(this.#dateTime);
    const result = addPackageOutputModel.getOutput(data);

    return [null, result];
  }
}

module.exports = PackageController;
