/**
 * Created by pooya on 8/29/21.
 */

const PackageController = require('./packageController');

class PackageControllerFactory {
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
   * @param {IPackageService} packageService
   * @param {IDateTime} dateTime
   */
  constructor(packageService, dateTime) {
    this.#packageService = packageService;
    this.#dateTime = dateTime;
  }

  /**
   *
   * @param req
   * @param res
   * @return {PackageController}
   */
  create(req, res) {
    return new PackageController(req, res, this.#packageService, this.#dateTime);
  }
}

module.exports = PackageControllerFactory;
