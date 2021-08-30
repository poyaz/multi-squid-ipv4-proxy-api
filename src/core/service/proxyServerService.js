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
   * @type {IProxyServerRepository}
   */
  #proxyServerFileRepository;
  /**
   * @type {IProxyServerRepository}
   */
  #ipAddrRepository;
  /**
   * @type {IJobService}
   */
  #jobService;

  /**
   *
   * @param {IProxyServerRepository} proxyServerRepository
   * @param {IProxyServerRepository} proxyServerFileRepository
   * @param {IProxyServerRepository} ipAddrRepository
   * @param {IJobService} jobService
   */
  constructor(proxyServerRepository, proxyServerFileRepository, ipAddrRepository, jobService) {
    super();

    this.#proxyServerRepository = proxyServerRepository;
    this.#proxyServerFileRepository = proxyServerFileRepository;
    this.#ipAddrRepository = ipAddrRepository;
    this.#jobService = jobService;
  }

  async add(model) {
    const ipMask = `${model.ip}/${model.mask}`;
    const generateIp = ipAddresses.v4.subnet(ipMask);
    const iteratorIpList = generateIp.getHostsIterator();
    const ipModels = [];

    for (const item of iteratorIpList) {
      const ip = item.toString();
      if (ip === model.gateway) {
        continue;
      }

      const tmpModel = new IpAddressModel();
      tmpModel.ip = ip;
      tmpModel.mask = 32;
      tmpModel.gateway = model.gateway;
      tmpModel.interface = model.interface;

      ipModels.push(tmpModel);
    }

    const [ipAddError] = await this.#proxyServerRepository.add(ipModels);
    if (ipAddError) {
      return [ipAddError];
    }

    const jobModel = new JobModel();
    jobModel.data = ipMask;
    jobModel.status = JobModel.STATUS_PENDING;
    jobModel.totalRecord = ipModels.length;

    const [jobAddError, jobAddId] = await this.#jobService.add(jobModel);
    if (jobAddError) {
      return [jobAddError];
    }

    return [null, jobAddId];
  }
}

module.exports = ProxyServerService;
