/**
 * Created by pooya on 4/30/22.
 */

const axios = require('axios');
const OrderModel = require('~src/core/model/orderModel');
const IOrderRepository = require('~src/core/interface/iOrderRepository');
const UnknownException = require('~src/core/exception/unknownException');
const ApiCallException = require('~src/core/exception/apiCallException');
const NotFoundException = require('~src/core/exception/notFoundException');
const UnauthorizedException = require('~src/core/exception/unauthorizedException');
const ForbiddenException = require('~src/core/exception/forbiddenException');

class OrderFastspringApiRepository extends IOrderRepository {
  /**
   * @type {IOrderRepository}
   */
  #orderRepository;
  /**
   * @type {IFastspringApiRepository}
   */
  #fastspringApiRepository;
  /**
   * @type {string}
   */
  #apiDomain;
  /**
   * @type {Object}
   */
  #reqOption;

  constructor(orderRepository, fastspringApiRepository, apiUsername, apiPassword, apiDomain) {
    super();

    this.#orderRepository = orderRepository;
    this.#fastspringApiRepository = fastspringApiRepository;
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

  async getById(orderId) {
    const [fetchError, fetchData] = await this.#orderRepository.getById(orderId);
    if (fetchError) {
      return [fetchError];
    }
    if (!fetchData || (fetchData && !fetchData.orderSerial)) {
      return [null, fetchData];
    }

    const [fastspringError] = await this.#fastspringApiRepository.getOrder(orderId);
    if (fastspringError) {
      return [fastspringError];
    }

    return [null, fetchData];
  }

  async getAll(filterModel) {
    return this.#orderRepository.getAll(filterModel);
  }

  async getSubscriptionById(subscriptionId) {
    return this.#orderRepository.getSubscriptionById(subscriptionId);
  }

  async getAllSubscriptionByOrderId(orderId) {
    return this.#orderRepository.getAllSubscriptionByOrderId(orderId);
  }

  async add(model) {
    if (model.orderSerial) {
      const [error] = await this._verifyOrderInfo(model);
      if (error) {
        return [error];
      }
    }

    return this.#orderRepository.add(model);
  }

  async addSubscription(model) {
    return this.#orderRepository.addSubscription(model);
  }

  async update(model) {
    if (model.orderSerial || model.status) {
      const [error] = await this._verifyOrderInfo(model);
      if (error) {
        return [error];
      }
    }

    return this.#orderRepository.update(model);
  }

  async _verifyOrderInfo(model) {
    try {
      const response = await axios.get(
        `${this.#apiDomain}/orders/${model.orderSerial}`,
        this.#reqOption,
      );

      if (
        response.data['order'] &&
        response.data['completed'] === true &&
        response.data['result'] === 'success'
      ) {
        model.status = OrderModel.STATUS_SUCCESS;
      } else {
        model.status = OrderModel.STATUS_FAIL;
      }

      model.orderBodyData = JSON.stringify(response.data);

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

module.exports = OrderFastspringApiRepository;
