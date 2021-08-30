/**
 * Created by pooya on 8/30/21.
 */

const JobModel = require('~src/core/model/jobModel');
const IJobService = require('~src/core/interface/iJobService');

class ProxyServerJobService extends IJobService {
  /**
   * @type {IJobRepository}
   */
  #jobRepository;
  /**
   * @type {IProxyServerRepository}
   */
  #proxyServerRepository;
  /**
   * @type {IProxyServerRepository}
   */
  #proxyServerFileRepository;
  /**
   * @type {IProxyServerRepository}
   */
  #ipAddrRepository;

  /**
   *
   * @param {IJobRepository} jobRepository
   * @param {IProxyServerRepository} proxyServerRepository
   * @param {IProxyServerRepository} proxyServerFileRepository
   * @param {IProxyServerRepository} ipAddrRepository
   */
  constructor(jobRepository, proxyServerRepository, proxyServerFileRepository, ipAddrRepository) {
    super();

    this.#jobRepository = jobRepository;
    this.#proxyServerRepository = proxyServerRepository;
    this.#proxyServerFileRepository = proxyServerFileRepository;
    this.#ipAddrRepository = ipAddrRepository;
  }

  async add(model) {
    model.status = JobModel.STATUS_PROCESSING;

    const [addJobError, jobData] = await this.#jobRepository.add(model);
    if (addJobError) {
      return [addJobError];
    }

    process.nextTick(async () => {
      await this.execute(jobData);
    });

    return [null, jobData];
  }
}

module.exports = ProxyServerJobService;
