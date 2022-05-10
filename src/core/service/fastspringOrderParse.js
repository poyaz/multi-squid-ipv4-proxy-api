/**
 * Created by pooya on 5/1/22.
 */

const OrderModel = require('~src/core/model/orderModel');
const PackageModel = require('~src/core/model/packageModel');
const SubscriptionModel = require('~src/core/model/subscriptionModel');
const IOrderParserService = require('~src/core/interface/iOrderParserService');
const ExternalStoreModel = require('~src/core/model/externalStoreModel');
const PaymentDataMatchException = require('~src/core/exception/paymentDataMatchException');
const PaymentServiceMatchException = require('~src/core/exception/paymentServiceMatchException');

class FastspringOrderParse extends IOrderParserService {
  /**
   * @type {IPackageService}
   */
  #packageService;
  /**
   * @type {IOrderService}
   */
  #orderService;
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
   * @param {IOrderService} orderService
   * @param {IOrderRepository} orderRepository
   * @param {IFastspringApiRepository} fastspringApiRepository
   */
  constructor(packageService, orderService, orderRepository, fastspringApiRepository) {
    super();

    this.#packageService = packageService;
    this.#orderService = orderService;
    this.#orderRepository = orderRepository;
    this.#fastspringApiRepository = fastspringApiRepository;
  }

  async parse(serviceName, data) {
    if (ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING !== serviceName) {
      return [new PaymentServiceMatchException()];
    }

    if (!Object.hasOwnProperty.call(data, 'events')) {
      return [new PaymentDataMatchException()];
    }

    for await (const event of data.events) {
      const match = /^subscription\.(.+)/.exec(event.type);
      if (!match) {
        continue;
      }

      let error;
      switch (match[1]) {
        case 'activated':
          [error] = await this._activeSubscription(event.data);
          break;
        case 'canceled':
          [error] = await this._cancelSubscription(event.data);
          break;
      }

      if (error) {
        console.error('Error on parse event', error);
      }
    }

    return [null];
  }

  async _activeSubscription(data) {
    const orderSerial = data.initialOrderId;
    const subscriptionSerial = data.id;

    const [orderError, orderData] = await this.#fastspringApiRepository.getOrder(orderSerial);
    if (orderError) {
      return [orderError];
    }

    const model = new SubscriptionModel();
    model.orderId = orderData.id;
    model.serial = subscriptionSerial;
    model.status = SubscriptionModel.STATUS_ACTIVATED;
    model.subscriptionBodyData = JSON.stringify(data);

    const [error] = await this.#orderRepository.addSubscription(model);
    if (error) {
      return [error];
    }

    return [null];
  }

  async _cancelSubscription(data) {
    const orderSerial = data.initialOrderId;
    const subscriptionSerial = data.id;

    const filterModel = new OrderModel();
    filterModel.orderSerial = orderSerial;
    const [orderError, orderDataList] = await this.#orderRepository.getAll(filterModel);
    if (orderError) {
      return [orderError];
    }
    if (orderDataList.length === 0) {
      return [null];
    }

    const orderData = orderDataList[0];
    if (!orderData.packageId) {
      return [null];
    }

    const [packageError, packageData] = await this.#packageService.getById(orderData.packageId);
    if (packageError) {
      return [packageError];
    }
    if (packageData.status !== PackageModel.STATUS_ENABLE) {
      return [null];
    }

    const [cancelError] = await this.#packageService.cancel(orderData.packageId);
    if (cancelError) {
      return [cancelError];
    }

    const model = new SubscriptionModel();
    model.orderId = orderData.id;
    model.serial = subscriptionSerial;
    model.status = SubscriptionModel.STATUS_CANCELED;
    model.subscriptionBodyData = JSON.stringify(data);

    const [error] = await this.#orderRepository.addSubscription(model);
    if (error) {
      return [error];
    }

    return [null];
  }
}

module.exports = FastspringOrderParse;
