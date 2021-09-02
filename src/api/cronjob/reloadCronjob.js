/**
 * Created by pooya on 9/2/21.
 */

class ReloadCronjob {
  /**
   * @type {IProxyServerService}
   */
  #proxyServerService;

  /**
   *
   * @param {IProxyServerService} proxyServerService
   */
  constructor(proxyServerService) {
    this.#proxyServerService = proxyServerService;
  }

  async reload() {
    try {
      const [error] = await this.#proxyServerService.reload();
      if (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = ReloadCronjob;
