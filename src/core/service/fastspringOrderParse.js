/**
 * Created by pooya on 5/1/22.
 */

const axios = require('axios');
const SubscriptionModel = require('~src/core/model/subscriptionModel');
const IOrderParserService = require('~src/core/interface/iOrderParserService');
const ExternalStoreModel = require('~src/core/model/externalStoreModel');
const UnknownException = require('~src/core/exception/unknownException');
const ApiCallException = require('~src/core/exception/apiCallException');
const NotFoundException = require('~src/core/exception/notFoundException');
const ForbiddenException = require('~src/core/exception/forbiddenException');
const UnauthorizedException = require('~src/core/exception/unauthorizedException');
const PaymentDataMatchException = require('~src/core/exception/paymentDataMatchException');
const PaymentServiceMatchException = require('~src/core/exception/paymentServiceMatchException');

class FastspringOrderParse extends IOrderParserService {
  /**
   * @type {IOrderService}
   */
  #orderService;
  /**
   * @type {IOrderRepository}
   */
  #orderRepository;
  /**
   * @type {string}
   */
  #apiDomain;
  /**
   * @type {Object}
   */
  #reqOption;

  /**
   *
   * @param {IOrderService} orderService
   * @param {IOrderRepository} orderRepository
   * @param {string} apiUsername
   * @param {string} apiPassword
   * @param {string} apiDomain
   */
  constructor(orderService, orderRepository, apiUsername, apiPassword, apiDomain) {
    super();

    this.#orderService = orderService;
    this.#orderRepository = orderRepository;
    this.#apiDomain = apiDomain;
    this.#reqOption = {
      headers: {
        'Content-Type': 'application/json',
      },
      auth: {
        username: apiUsername,
        password: apiPassword,
      },
    };
  }

  async parse(serviceName, data) {
    if (ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING !== serviceName) {
      return [new PaymentServiceMatchException()];
    }

    if (!Object.hasOwnProperty.call(data, 'events')) {
      return [new PaymentDataMatchException()];
    }

    for await (const event of data.events) {
      if (!/^subscription\..+/.exec(event.type)) {
        continue;
      }

      const [error] = await this._verifyOrderAndSubscription(event.type, event.data);
      if (error) {
        console.error('Error on parse event', error);
      }
    }

    return [null];
  }

  async _verifyOrderAndSubscription(type, data) {
    const orderSerial = data.initialOrderId;
    const subscriptionSerial = data.id;

    try {
      const response = await axios.get(`${this.#apiDomain}/orders/${orderSerial}`, this.#reqOption);

      const model = new SubscriptionModel();
      model.orderId = response.data['tags']['orderId'];
      model.serial = subscriptionSerial;
      switch (/^subscription\.(.+)/.exec(type)[1]) {
        case 'activated':
          model.status = SubscriptionModel.STATUS_ACTIVATED;
          break;
        case 'canceled':
          model.status = SubscriptionModel.STATUS_CANCELED;
          break;
        case 'uncanceled':
          model.status = SubscriptionModel.STATUS_UNCANCELED;
          break;
        case 'deactivated':
          model.status = SubscriptionModel.STATUS_DEACTIVATED;
          break;
        case 'charge.completed':
          model.status = SubscriptionModel.STATUS_CHARGE_COMPLETED;
          break;
        case 'charge.failed':
          model.status = SubscriptionModel.STATUS_CHARGE_FAILED;
          break;
      }
      model.subscriptionBodyData = JSON.stringify(data);

      const [error] = await this.#orderRepository.addSubscription(model);
      if (error) {
        return [error];
      }

      return [null];
    } catch (error) {
      return this._errorHandler(error);
    }
  }

  _errorHandler(error) {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          return [new UnauthorizedException()];
        case 403:
          return [new ForbiddenException()];
        case 404:
          return [new NotFoundException()];
      }

      console.error(error.response.data);

      return [new UnknownException()];
    } else if (error.request) {
      return [new ApiCallException()];
    }

    return [new ApiCallException()];
  }
}

module.exports = FastspringOrderParse;
