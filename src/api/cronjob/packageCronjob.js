/**
 * Created by pooya on 9/2/21.
 */

class PackageCronjob {
  /**
   * @type {IPackageService}
   */
  #packageService;

  /**
   *
   * @param {IPackageService} packageService
   */
  constructor(packageService) {
    this.#packageService = packageService;
  }

  async disableExpirePackage() {
    try {
      const [error] = await this.#packageService.disableExpirePackage();
      if (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = PackageCronjob;
