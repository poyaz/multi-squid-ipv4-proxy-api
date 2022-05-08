/**
 * Created by pooya on 5/2/22.
 */

const IPackageService = require('~src/core/interface/iPackageService');
const OrderModel = require('~src/core/model/orderModel');
const PackageModel = require('~src/core/model/packageModel');
const SubscriptionModel = require('~src/core/model/subscriptionModel');

class FastspringPackageService extends IPackageService {
  /**
   * @type {IPackageService}
   */
  #packageService;
  /**
   * @type {IPackageRepository}
   */
  #packageRepository;
  /**
   * @type {IOrderRepository}
   */
  #orderRepository;
  /**
   * @type {IFastspringApiRepository}
   */
  #fastspringApiRepository;

  /**
   *
   * @param {IPackageService} packageService
   * @param {IPackageRepository} packageRepository
   * @param {IOrderRepository} orderRepository
   * @param {IFastspringApiRepository} fastspringApiRepository
   */
  constructor(packageService, packageRepository, orderRepository, fastspringApiRepository) {
    super();

    this.#packageService = packageService;
    this.#packageRepository = packageRepository;
    this.#orderRepository = orderRepository;
    this.#fastspringApiRepository = fastspringApiRepository;
  }

  async getById(id) {
    return this.#packageService.getById(id);
  }

  async getAllByUsername(username, filterModel) {
    return this.#packageService.getAllByUsername(username, filterModel);
  }

  async add(model) {
    return this.#packageService.add(model);
  }

  async renew(id, expireDate) {
    return this.#packageService.renew(id, expireDate);
  }

  async cancel(id) {
    const filterOrder = new OrderModel();
    filterOrder.packageId = id;

    const [orderError, orderData] = await this.#orderRepository.getAll(filterOrder);
    if (orderError) {
      return [orderError];
    }

    let expireDate = null;
    if (orderData.length === 1 && orderData[0].packageId) {
      const [
        subscriptionError,
        subscriptionData,
      ] = await this.#orderRepository.getAllSubscriptionByOrderId(orderData[0].id);
      if (subscriptionError) {
        return [subscriptionError];
      }

      const fetchTasks = subscriptionData
        .filter((v) => v.status === SubscriptionModel.STATUS_ACTIVATED)
        .filter((data, index, arr) => arr.findIndex((v) => v.serial === data.serial) === index)
        .map((v) => this.#fastspringApiRepository.getSubscription(v.serial));

      const cancelTask = [];
      const resultFetchTasks = await Promise.all(fetchTasks);
      for (let i = 0; i < resultFetchTasks.length; i++) {
        const [fetchSubscriptionError, fetchSubscriptionData] = resultFetchTasks[i];
        if (fetchSubscriptionError) {
          return [fetchSubscriptionError];
        }

        if (
          fetchSubscriptionData &&
          fetchSubscriptionData.status === SubscriptionModel.STATUS_ACTIVATED
        ) {
          const job = this.#fastspringApiRepository.cancelSubscription(
            fetchSubscriptionData.serial,
          );
          cancelTask.push(job);
        }
      }

      if (cancelTask.length > 0) {
        const resultCancelTasks = await Promise.all(cancelTask);
        for (let i = 0; i < resultCancelTasks.length; i++) {
          const [cancelSubscriptionError] = resultCancelTasks[i];
          if (cancelSubscriptionError) {
            return [cancelSubscriptionError];
          }
        }
      }

      expireDate = new Date(
        new Date().getTime() + orderData[0].prePackageOrderInfo.expireDay * 24 * 60 * 60 * 1000,
      );
    }

    const [cancelError] = await this.#packageService.cancel(id);
    if (cancelError) {
      return [cancelError];
    }

    if (expireDate) {
      const updateExpireDateModel = new PackageModel();
      updateExpireDateModel.id = id;
      updateExpireDateModel.renewalDate = null;
      updateExpireDateModel.expireDate = expireDate;
      const [updateExpireDateError] = await this.#packageRepository.update(updateExpireDateModel);
      if (updateExpireDateError) {
        return [updateExpireDateError];
      }
    }

    return [null];
  }

  async disableExpirePackage() {
    return this.#packageService.disableExpirePackage();
  }

  async remove(id) {
    return this.#packageService.remove(id);
  }

  async syncPackageById(id) {
    return this.#packageService.syncPackageById(id);
  }
}

module.exports = FastspringPackageService;
