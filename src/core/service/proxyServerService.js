/**
 * Created by pooya on 8/30/21.
 */

const ipAddresses = require('ip-addresses');
const JobModel = require('~src/core/model/jobModel');
const IpAddressModel = require('~src/core/model/ipAddressModel');
const IProxyServerService = require('~src/core/interface/iProxyServerService');

class ProxyServerService extends IProxyServerService {
  /**
   * @type {IProxyServerRepository}
   */
  #proxyServerRepository;
  /**
   * @type {IJobService}
   */
  #proxyServerJobService;
  /**
   * @type {IProxyServerRepository}
   */
  #proxySquidRepository;
  /**
   * @type {IJobService}
   */
  #proxyServerDeleteJobService;
  /**
   * @type {number}
   */
  #defaultPort = 3128;

  /**
   *
   * @param {IProxyServerRepository} proxyServerRepository
   * @param {IJobService} proxyServerJobService
   * @param {IProxyServerRepository} proxySquidRepository
   * @param {IJobService} proxyServerDeleteJobService
   */
  constructor(proxyServerRepository, proxyServerJobService, proxySquidRepository, proxyServerDeleteJobService) {
    super();

    this.#proxyServerRepository = proxyServerRepository;
    this.#proxyServerJobService = proxyServerJobService;
    this.#proxySquidRepository = proxySquidRepository;
    this.#proxyServerDeleteJobService = proxyServerDeleteJobService;
  }

  async getAll() {
    return this.#proxyServerRepository.getAll();
  }

  async add(model) {
    const ipMask = `${model.ip}/${model.mask}`;
    const generateIp = ipAddresses.v4.subnet(ipMask);
    const iteratorIpList = generateIp.getHostsIterator();
    const ipModels = [];

    if (model.mask === 32) {
      const tmpModel = new IpAddressModel();
      tmpModel.ip = model.ip;
      tmpModel.mask = 32;
      tmpModel.port = this.#defaultPort;
      tmpModel.gateway = model.gateway;
      tmpModel.interface = model.interface;

      ipModels.push(tmpModel);
    } else {
      for (const item of iteratorIpList) {
        const ip = item.toString();
        if (ip === model.gateway) {
          continue;
        }

        const tmpModel = new IpAddressModel();
        tmpModel.ip = ip;
        tmpModel.mask = 32;
        tmpModel.port = this.#defaultPort;
        tmpModel.gateway = model.gateway;
        tmpModel.interface = model.interface;

        ipModels.push(tmpModel);
      }
    }

    const [ipAddError] = await this.#proxyServerRepository.add(ipModels);
    if (ipAddError) {
      return [ipAddError];
    }

    const jobModel = new JobModel();
    jobModel.data = ipMask;
    jobModel.status = JobModel.STATUS_PENDING;
    jobModel.totalRecord = ipModels.length;

    const [jobAddError, jobAddData] = await this.#proxyServerJobService.add(jobModel);
    if (jobAddError) {
      return [jobAddError];
    }

    return [null, jobAddData];
  }

  async reload() {
    return this.#proxySquidRepository.reload();
  }

  async delete(model) {
    const ipMask = `${model.ip}/${model.mask}`;

    const [deleteError, deleteCount] = await this.#proxyServerRepository.delete(model);
    if (deleteError) {
      return [deleteError];
    }

    const jobModel = new JobModel();
    jobModel.type = JobModel.TYPE_REMOVE_IP;
    jobModel.data = ipMask;
    jobModel.status = JobModel.STATUS_PENDING;
    jobModel.totalRecord = deleteCount;
    jobModel.totalRecordDelete = deleteCount;

    const [jobAddError, jobAddData] = await this.#proxyServerDeleteJobService.add(jobModel);
    if (jobAddError) {
      return [jobAddError];
    }

    return [null, jobAddData];
  }
}

module.exports = ProxyServerService;
