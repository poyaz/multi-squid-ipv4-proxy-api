/**
 * Created by pooya on 5/8/22.
 */

const axios = require('axios');
const IFastspringApiRepository = require('~src/core/interface/iFastspringApiRepository');
const UnknownException = require('~src/core/exception/unknownException');
const ApiCallException = require('~src/core/exception/apiCallException');
const NotFoundException = require('~src/core/exception/notFoundException');
const UnauthorizedException = require('~src/core/exception/unauthorizedException');
const ForbiddenException = require('~src/core/exception/forbiddenException');
const InvalidOrderPaymentException = require('~src/core/exception/invalidOrderPaymentException');
const FastspringAlreadyCanceledException = require('~src/core/exception/fastspringAlreadyCanceledException');
const OrderModel = require('~src/core/model/orderModel');
const SubscriptionModel = require('~src/core/model/subscriptionModel');
const ExternalStoreModel = require('~src/core/model/externalStoreModel');
const PaymentServiceModel = require('~src/core/model/paymentServiceModel');

class FastspringApiRepository extends IFastspringApiRepository {
  /**
   * @type {IPaymentService}
   */
  #paymentService;
  /**
   * @type {string}
   */
  #apiDomain;
  /**
   * @type {Object}
   */
  #reqOption;

  constructor(paymentService, apiUsername, apiPassword, apiDomain) {
    super();

    this.#paymentService = paymentService;
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

  async getOrder(orderSerial) {
    try {
      const response = await axios.get(`${this.#apiDomain}/orders/${orderSerial}`, this.#reqOption);

      const [error, data] = await this.#paymentService.getAllPaymentMethod();
      if (error) {
        return [error];
      }

      const serviceMode = data.filter(
        (v) => v.serviceName === ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
      )[0];
      if (
        serviceMode &&
        serviceMode.mode === PaymentServiceModel.MODE_PRODUCT &&
        response.data['payment']['type'] === 'test'
      ) {
        return [new InvalidOrderPaymentException()];
      }

      const model = new OrderModel();
      model.id = response.data['tags']['orderId'];
      model.serviceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      model.orderSerial = response.data['id'];
      model.status = response.data['completed']
        ? OrderModel.STATUS_SUCCESS
        : OrderModel.STATUS_FAIL;
      model.orderBodyData = JSON.stringify(response.data);

      return [null, model];
    } catch (error) {
      return this._errorHandler(error);
    }
  }

  async getProductPrice(productSerial) {
    try {
      const response = await axios.get(
        `${this.#apiDomain}/products/price/${productSerial}`,
        this.#reqOption,
      );

      const model = new ExternalStoreModel();
      model.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      model.serial = productSerial;
      this._fillProductPrice(model, response.data);

      return [null, model];
    } catch (error) {
      return this._errorHandler(error);
    }
  }

  async getSubscription(subscriptionSerial) {
    try {
      const response = await axios.get(
        `${this.#apiDomain}/subscriptions/${subscriptionSerial}`,
        this.#reqOption,
      );

      const result = this._fillSubscription(response.data);

      return [null, result];
    } catch (error) {
      return this._errorHandler(error);
    }
  }

  async cancelSubscription(subscriptionSerial) {
    try {
      await axios.delete(`${this.#apiDomain}/subscriptions/${subscriptionSerial}`, this.#reqOption);

      return [null];
    } catch (error) {
      return this._errorHandler(error);
    }
  }

  _fillProductPrice(model, row) {
    const data = Object.entries(row['products'][0]['pricing']);
    data.map(([key, value]) =>
      model.price.push({
        value: value.price,
        unit: value.currency.toUpperCase(),
        country: key.toUpperCase(),
      }),
    );
  }

  _fillSubscription(row) {
    const model = new SubscriptionModel();
    model.orderId = row['tags']['orderId'];
    model.serial = row['id'];
    switch (row['state']) {
      case 'active':
        model.status = SubscriptionModel.STATUS_ACTIVATED;
        break;
      case 'canceled':
        model.status = SubscriptionModel.STATUS_CANCELED;
        break;
    }

    return model;
  }

  _errorHandler(error) {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          if (error.response.data) {
            if (
              Object.hasOwnProperty.call(error.response.data, 'subscriptions') &&
              error.response.data.subscriptions[0].error.subscription.match(/canceled/)
            ) {
              return [new FastspringAlreadyCanceledException(error)];
            }
          }
          break;
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

module.exports = FastspringApiRepository;
