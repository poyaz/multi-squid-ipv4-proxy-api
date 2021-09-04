/**
 * Created by pooya on 9/4/21.
 */

const JobModel = require('~src/core/model/jobModel');
const IJobService = require('~src/core/interface/iJobService');

class ProxyServerRegenerateJobService extends IJobService {
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
   *
   * @param {IJobRepository} jobRepository
   * @param {IProxyServerRepository} proxyServerRepository
   * @param {IProxyServerRepository} proxyServerFileRepository
   */
  constructor(jobRepository, proxyServerRepository, proxyServerFileRepository) {
    super();

    this.#jobRepository = jobRepository;
    this.#proxyServerRepository = proxyServerRepository;
    this.#proxyServerFileRepository = proxyServerFileRepository;
  }

  async add(model) {
    model.status = JobModel.STATUS_PROCESSING;

    const [addJobError, jobData] = await this.#jobRepository.add(model);
    if (addJobError) {
      return [addJobError];
    }

    jobData.totalRecord = model.totalRecord;
    jobData.totalRecordDelete = model.totalRecordDelete;

    process.nextTick(async () => {
      await this.execute(jobData);
    });

    return [null, jobData];
  }

  async execute(model) {
    const [allIpListError, allIpList] = await this.#proxyServerRepository.getAll();
    if (allIpListError) {
      await this._updateJobStatus(allIpListError, model);
      return;
    }

    const [addProxyError] = await this.#proxyServerFileRepository.add(allIpList);
    if (addProxyError) {
      await this._updateJobStatus(addProxyError, model);
      return;
    }

    await this._updateJobStatus(null, model);
  }

  async _updateJobStatus(error, model) {
    const updateModel = model.clone();

    if (error) {
      console.error('executeError', error);
      updateModel.status = JobModel.STATUS_FAIL;
    } else {
      updateModel.status = JobModel.STATUS_SUCCESS;
    }

    const [updateError] = await this.#jobRepository.update(updateModel);
    if (updateError) {
      console.error('updateExecuteError', updateError);
    }
  }
}

module.exports = ProxyServerRegenerateJobService;
