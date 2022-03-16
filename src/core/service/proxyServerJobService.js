/**
 * Created by pooya on 8/30/21.
 */

const { networkInterfaces } = require('os');
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

  async execute(model) {
    const [fetchIpListError, fetchIpList] = await this.#proxyServerRepository.getByIpMask(
      model.data,
    );
    if (fetchIpListError) {
      await this._updateJobStatus(fetchIpListError, model, 0, 0, model.totalRecord);
      return;
    }

    let totalAdd = 0;
    let totalExist = 0;
    let totalError = 0;
    let lastErrorCatch = null;

    const globalIpMask = Number(model.data.split('/')[1]);
    fetchIpList.map((v) => (v.mask = globalIpMask));

    const tasks = fetchIpList
      .map((v) => new Array(1).fill(v))
      .map((v) => this.#ipAddrRepository.add(v));
    const executeTasks = await Promise.all(tasks);

    for (const [addIpError, addIpData] of executeTasks) {
      if (addIpError) {
        lastErrorCatch = addIpError;
        totalError++;
        continue;
      }

      if (addIpData.length > 0) {
        totalAdd++;
      } else {
        totalExist++;
      }
    }

    if (totalError > 0) {
      await this._updateJobStatus(lastErrorCatch, model, totalAdd, totalExist, totalError);
      return;
    }

    const [activeIpMaskError] = await this.#proxyServerRepository.activeIpMask(model.data);
    if (activeIpMaskError) {
      await this._updateJobStatus(activeIpMaskError, model, totalAdd, totalExist, totalError);
      return;
    }

    const [allIpListError, allIpList] = await this.#proxyServerRepository.getAll();
    if (allIpListError) {
      await this._updateJobStatus(allIpListError, model, totalAdd, totalExist, totalError);
      return;
    }

    const nets = networkInterfaces();
    const allIpListExist = [];
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        allIpListExist.push(net.address);
      }
    }

    const allIpListFilter = allIpList.filter((v) => v.ip && allIpListExist.indexOf(v.ip) > -1);

    const [addProxyError] = await this.#proxyServerFileRepository.add(allIpListFilter);
    if (addProxyError) {
      await this._updateJobStatus(addProxyError, model, totalAdd, totalExist, totalError);
      return;
    }

    await this._updateJobStatus(null, model, totalAdd, totalExist, 0);
  }

  async _updateJobStatus(error, model, totalAdd, totalExist, totalError) {
    const updateModel = model.clone();

    if (error) {
      console.error('executeError', error);
      updateModel.status = JobModel.STATUS_FAIL;
    } else {
      updateModel.status = JobModel.STATUS_SUCCESS;
    }

    updateModel.totalRecordAdd = totalAdd;
    updateModel.totalRecordExist = totalExist;
    updateModel.totalRecordError = totalError;

    const [updateError] = await this.#jobRepository.update(updateModel);
    if (updateError) {
      console.error('updateExecuteError', updateError);
    }
  }
}

module.exports = ProxyServerJobService;
