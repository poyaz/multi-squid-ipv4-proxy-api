/**
 * Created by pooya on 8/25/21.
 */

const AddPackageInputModel = require('./model/addPackageInputModel');
const AddPackageOutputModel = require('./model/addPackageOutputModel');
const GetAllByUsernamePackageOutputModel = require('./model/getAllByUsernamePackageOutputModel');
const RenewPackageInputModel = require('./model/renewPackageInputModel');
const GetAllByUsernamePackageInputModel = require('./model/getAllByUsernamePackageInputModel');

class PackageController {
  #req;
  #res;
  /**
   * @type {IPackageService}
   */
  #packageService;
  /**
   * @type {IPackageService}
   */
  #findClusterPackageService;
  /**
   * @type {IDateTime}
   */
  #dateTime;

  /**
   *
   * @param req
   * @param res
   * @param {IPackageService} packageService
   * @param {IPackageService} findClusterPackageService
   * @param {IDateTime} dateTime
   */
  constructor(req, res, packageService, findClusterPackageService, dateTime) {
    this.#req = req;
    this.#res = res;
    this.#packageService = packageService;
    this.#findClusterPackageService = findClusterPackageService;
    this.#dateTime = dateTime;
  }

  async getAllByUsername() {
    const { username } = this.#req.params;
    const qs = this.#req.query;

    const getAllByUsernamePackageInputModel = new GetAllByUsernamePackageInputModel();
    const filterModel = getAllByUsernamePackageInputModel.getModel(qs);

    const [error, data] = await this.#findClusterPackageService.getAllByUsername(
      username,
      filterModel,
    );
    if (error) {
      return [error];
    }

    const getAllByUsernamePackageOutputModel = new GetAllByUsernamePackageOutputModel(
      this.#dateTime,
    );
    const result = getAllByUsernamePackageOutputModel.getOutput(data);

    return [null, result];
  }

  async getAllByUsernameInSelfInstance() {
    const { username } = this.#req.params;
    const qs = this.#req.query;

    const getAllByUsernamePackageInputModel = new GetAllByUsernamePackageInputModel();
    const filterModel = getAllByUsernamePackageInputModel.getModel(qs);

    const [error, data] = await this.#packageService.getAllByUsername(username, filterModel);
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

    const [error, data] = await this.#findClusterPackageService.add(model);
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

    const [error] = await this.#findClusterPackageService.renew(packageId, expireDate);
    if (error) {
      return [error];
    }

    return [null, { expireDate: body.expire }];
  }

  async cancelPackage() {
    const { packageId } = this.#req.params;

    const [error] = await this.#findClusterPackageService.cancel(packageId);
    if (error) {
      return [error];
    }

    return [null];
  }

  async removePackage() {
    const { packageId } = this.#req.params;

    const [error] = await this.#findClusterPackageService.remove(packageId);
    if (error) {
      return [error];
    }

    return [null];
  }

  async syncPackage() {
    const { packageId } = this.#req.params;

    const [error] = await this.#findClusterPackageService.syncPackageById(packageId);
    if (error) {
      return [error];
    }

    return [null];
  }

  async syncPackageInSelfInstance() {
    const { packageId } = this.#req.params;

    const [error] = await this.#packageService.syncPackageById(packageId);
    if (error) {
      return [error];
    }

    return [null];
  }
}

module.exports = PackageController;
