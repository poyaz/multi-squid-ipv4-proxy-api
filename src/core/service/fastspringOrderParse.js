/**
 * Created by pooya on 5/1/22.
 */

const OrderModel = require('~src/core/model/orderModel');
const PackageModel = require('~src/core/model/packageModel');
const SubscriptionModel = require('~src/core/model/subscriptionModel');
const IOrderParserService = require('~src/core/interface/iOrderParserService');
const ExternalStoreModel = require('~src/core/model/externalStoreModel');
const PaymentServiceModel = require('~src/core/model/paymentServiceModel');
const PaymentDataMatchException = require('~src/core/exception/paymentDataMatchException');
const InvalidOrderPaymentException = require('~src/core/exception/invalidOrderPaymentException');
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
   * @type {IPaymentService}
   */
  #paymentService;

  /**
   *
   * @param {IPackageService} packageService
   * @param {IOrderService} orderService
   * @param {IOrderRepository} orderRepository
   * @param {IFastspringApiRepository} fastspringApiRepository
   * @param {IPaymentService} paymentService
   */
  constructor(
    packageService,
    orderService,
    orderRepository,
    fastspringApiRepository,
    paymentService,
  ) {
    super();

    this.#packageService = packageService;
    this.#orderService = orderService;
    this.#orderRepository = orderRepository;
    this.#fastspringApiRepository = fastspringApiRepository;
    this.#paymentService = paymentService;
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

      const [paymentError, paymentData] = await this.#paymentService.getAllPaymentMethod();
      if (paymentError) {
        return [paymentError];
      }
      const serviceMode = paymentData.filter(
        (v) => v.serviceName === ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
      )[0];
      if (
        serviceMode &&
        serviceMode.mode === PaymentServiceModel.MODE_PRODUCT &&
        !event.data['live']
      ) {
        return [new InvalidOrderPaymentException()];
      }

      let error;
      switch (match[1]) {
        case 'activated':
          [error] = await this._activeSubscription(event.data, SubscriptionModel.STATUS_ACTIVATED);
          break;
        case 'charge.completed':
          [error] = await this._activeSubscription(
            event.data,
            SubscriptionModel.STATUS_CHARGE_COMPLETED,
          );
          break;
        case 'canceled':
          [error] = await this._cancelSubscription(event.data, SubscriptionModel.STATUS_CANCELED);
          break;
        case 'deactivated':
          [error] = await this._cancelSubscription(
            event.data,
            SubscriptionModel.STATUS_DEACTIVATED,
          );
          break;
        case 'charge.failed':
          [error] = await this._cancelSubscription(
            event.data,
            SubscriptionModel.STATUS_CHARGE_FAILED,
          );
          break;
      }

      if (error) {
        console.error('Error on parse event', error);
      }
    }

    return [null];
  }

  async _activeSubscription(data, subscriptionStatus) {
    const orderSerial = data.initialOrderId;
    const subscriptionSerial = data.id;

    const [orderError, orderData] = await this.#fastspringApiRepository.getOrder(orderSerial);
    if (orderError) {
      return [orderError];
    }

    const model = new SubscriptionModel();
    model.orderId = orderData.id;
    model.serial = subscriptionSerial;
    model.status = subscriptionStatus;
    model.subscriptionBodyData = JSON.stringify(data);

    const [error] = await this.#orderRepository.addSubscription(model);
    if (error) {
      return [error];
    }

    if (orderData.packageId) {
      const renewalDate = new Date(
        new Date().getTime() + orderData.prePackageOrderInfo.expireDay * 24 * 60 * 60 * 1000,
      );
      const [renewalError] = await this.#packageService.renewal(orderData.packageId, renewalDate);
      if (renewalError) {
        return [renewalError];
      }
    }

    return [null];
  }

  async _cancelSubscription(data, subscriptionStatus) {
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
    model.status = subscriptionStatus;
    model.subscriptionBodyData = JSON.stringify(data);

    const [error] = await this.#orderRepository.addSubscription(model);
    if (error) {
      return [error];
    }

    return [null];
  }
}

module.exports = FastspringOrderParse;
