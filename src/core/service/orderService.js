/**
 * Created by pooya on 4/25/22.
 */

const IOrderService = require('~src/core/interface/iOrderService');
const OrderModel = require('~src/core/model/orderModel');
const PackageModel = require('~src/core/model/packageModel');
const NotFoundException = require('~src/core/exception/notFoundException');
const AlreadyExistException = require('~src/core/exception/alreadyExistException');
const ItemDisableException = require('~src/core/exception/itemDisableException');

class OrderService extends IOrderService {
  /**
   * @type {IProductService}
   */
  #productService;
  /**
   * @type {IPackageService}
   */
  #packageService;
  /**
   * @type {IOrderRepository}
   */
  #orderRepository;

  /**
   *
   * @param {IProductService} productService
   * @param {IPackageService} packageService
   * @param {IOrderRepository} orderRepository
   */
  constructor(productService, packageService, orderRepository) {
    super();

    this.#productService = productService;
    this.#packageService = packageService;
    this.#orderRepository = orderRepository;
  }

  async getByOrderSerial(orderSerial) {
    const filterModel = new OrderModel();
    filterModel.orderSerial = orderSerial;

    const [error, result] = await this.#orderRepository.getAll(filterModel);
    if (error) {
      return [error];
    }
    if (result.length === 0) {
      return [new NotFoundException()];
    }

    return [null, result[0]];
  }

  async getById(orderId) {
    const [error, result] = await this.#orderRepository.getById(orderId);
    if (error) {
      return [error];
    }
    if (!result) {
      return [new NotFoundException()];
    }

    return [null, result];
  }

  async getSubscriptionById(subscriptionId) {
    const [error, result] = await this.#orderRepository.getSubscriptionById(subscriptionId);
    if (error) {
      return [error];
    }
    if (!result) {
      return [new NotFoundException()];
    }

    return [null, result];
  }

  async getAllSubscriptionByOrderId(orderId) {
    return this.#orderRepository.getAllSubscriptionByOrderId(orderId);
  }

  async getAll(filterModel) {
    return this.#orderRepository.getAll(filterModel);
  }

  async add(model) {
    const [productError, productData] = await this.#productService.getById(model.productId);
    if (productError) {
      return [productError];
    }
    if (!productData.isEnable) {
      return [new ItemDisableException()];
    }
    const packageModel = new PackageModel();
    packageModel.userId = model.userId;
    packageModel.countIp = productData.count;
    packageModel.type = model.prePackageOrderInfo.proxyType;
    packageModel.country = model.prePackageOrderInfo.countryCode;
    const [packageError] = await this.#packageService.checkIpExistForCreatePackage(packageModel);
    if (packageError) {
      return [packageError];
    }

    model.prePackageOrderInfo.count = productData.count;
    model.prePackageOrderInfo.expireDay = productData.expireDay;

    return this.#orderRepository.add(model);
  }

  async addSubscription(model) {
    return this.#orderRepository.addSubscription(model);
  }

  async verifyOrderPackage(model) {
    const [fetchOrderError, fetchOrderData] = await this.getById(model.id);
    if (fetchOrderError) {
      return [fetchOrderError];
    }

    if (fetchOrderData.packageId) {
      return this.#packageService.getById(fetchOrderData.packageId);
    }

    if (fetchOrderData.orderSerial === model.orderSerial && fetchOrderData.status) {
      return [
        new AlreadyExistException(
          `This order status had been changed! If you don't access your package contact with administrator.`,
        ),
      ];
    }

    const preOrderUpdateModel = new OrderModel();
    preOrderUpdateModel.id = model.id;
    preOrderUpdateModel.orderSerial = model.orderSerial;
    preOrderUpdateModel.status = OrderModel.STATUS_SUCCESS;

    const [preOrderUpdateError] = await this.#orderRepository.update(preOrderUpdateModel);
    if (preOrderUpdateError) {
      return [preOrderUpdateError];
    }

    const addPackageModel = new PackageModel();
    addPackageModel.userId = fetchOrderData.userId;
    addPackageModel.username = fetchOrderData.username;
    addPackageModel.countIp = fetchOrderData.prePackageOrderInfo.count;
    addPackageModel.type = fetchOrderData.prePackageOrderInfo.proxyType;
    addPackageModel.country = fetchOrderData.prePackageOrderInfo.countryCode;
    addPackageModel.renewalDate = new Date(
      new Date().getTime() + fetchOrderData.prePackageOrderInfo.expireDay * 24 * 60 * 60 * 1000,
    );

    const [addPackageError, addPackageData] = await this.#packageService.add(addPackageModel);
    if (addPackageError) {
      return [addPackageError];
    }

    const connectPackageToOrder = new OrderModel();
    connectPackageToOrder.id = model.id;
    connectPackageToOrder.packageId = addPackageData.id;

    const [connectPackageToOrderError] = await this.#orderRepository.update(connectPackageToOrder);
    if (connectPackageToOrderError) {
      console.error(`Error in connect order "${model.id}" to package "${addPackageModel.id}"`);
    }

    return [null, addPackageData];
  }
}

module.exports = OrderService;
