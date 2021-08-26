/**
 * Created by pooya on 8/25/21.
 */

const AddPackageInputModel = require('./model/addPackageInputModel');
const AddPackageOutputModel = require('./model/addPackageOutputModel');
const GetAllByUsernamePackageOutputModel = require('./model/getAllByUsernamePackageOutputModel');
const RenewPackageInputModel = require('./model/renewPackageInputModel');

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

  async getAllByUsername() {
    const { username } = this.#req.params;

    const [error, data] = await this.#packageService.getAllByUsername(username);
    if (error) {
      return [error];
    }

    const getAllByUsernamePackageOutputModel = new GetAllByUsernamePackageOutputModel(
      this.#dateTime,
    );
    const result = getAllByUsernamePackageOutputModel.getOutput(data);

    return [null, result];
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

  async renewPackage() {
    const { body } = this.#req;
    const { packageId } = this.#req.params;

    const renewPackageInputModel = new RenewPackageInputModel(this.#dateTime);
    const expireDate = renewPackageInputModel.getModel(body);

    const [error] = await this.#packageService.renew(packageId, expireDate);
    if (error) {
      return [error];
    }

    return [null, { expireDate: body.expire }];
  }
}

module.exports = PackageController;
