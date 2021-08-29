/**
 * Created by pooya on 8/23/21.
 */

class IUrlAccessRepository {
  /**
   *
   * @param {UrlAccessModel} model
   * @return {Promise<(Error|UrlAccessModel|[])[]>}
   */
  async add(model) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { model };
    throw error;
  }

  /**
   *
   * @param {uuid} userId
   * @param {string} domain
   * @return {Promise<(Error|boolean)[]>}
   */
  async checkBlockDomainByUserId(userId, domain) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { userId, domain };
    throw error;
  }
}

module.exports = IUrlAccessRepository;
