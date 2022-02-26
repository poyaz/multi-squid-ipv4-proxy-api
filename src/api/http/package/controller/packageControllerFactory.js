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
   * @type {IPackageService}
   */
  #findClusterPackageService;
  /**
   * @type {IDateTime}
   */
  #dateTime;

  /**
   *
   * @param {IPackageService} packageService
   * @param {IPackageService} findClusterPackageService
   * @param {IDateTime} dateTime
   */
  constructor(packageService, findClusterPackageService, dateTime) {
    this.#packageService = packageService;
    this.#findClusterPackageService = findClusterPackageService;
    this.#dateTime = dateTime;
  }

  /**
   *
   * @param req
   * @param res
   * @return {PackageController}
   */
  create(req, res) {
    return new PackageController(
      req,
      res,
      this.#packageService,
      this.#findClusterPackageService,
      this.#dateTime,
    );
  }
}

module.exports = PackageControllerFactory;
