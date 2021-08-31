/**
 * Created by pooya on 8/31/21.
 */

const IJobService = require('~src/core/interface/iJobService');
const NotFoundException = require('~src/core/exception/notFoundException');

class JobService extends IJobService {
  /**
   * @type {IJobRepository}
   */
  #jobRepository;

  /**
   *
   * @param {IJobRepository} jobRepository
   */
  constructor(jobRepository) {
    super();

    this.#jobRepository = jobRepository;
  }

  async getById(id) {
    const [error, data] = await this.#jobRepository.getById(id);
    if (error) {
      return [error];
    }
    if (!data) {
      return [new NotFoundException()];
    }

    return [null, data];
  }
}

module.exports = JobService;
