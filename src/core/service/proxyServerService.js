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
   * @type {number}
   */
  #defaultPort = 3128;

  /**
   *
   * @param {IProxyServerRepository} proxyServerRepository
   * @param {IJobService} proxyServerJobService
   * @param {IProxyServerRepository} proxySquidRepository
   */
  constructor(proxyServerRepository, proxyServerJobService, proxySquidRepository) {
    super();

    this.#proxyServerRepository = proxyServerRepository;
    this.#proxyServerJobService = proxyServerJobService;
    this.#proxySquidRepository = proxySquidRepository;
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

    const [jobAddError, jobAddId] = await this.#proxyServerJobService.add(jobModel);
    if (jobAddError) {
      return [jobAddError];
    }

    return [null, jobAddId];
  }

  async reload() {
    return this.#proxySquidRepository.reload();
  }
}

module.exports = ProxyServerService;
