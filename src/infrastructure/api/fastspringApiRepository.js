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
const FastspringAlreadyCanceledException = require('~src/core/exception/fastspringAlreadyCanceledException');
const SubscriptionModel = require('~src/core/model/subscriptionModel');

class FastspringApiRepository extends IFastspringApiRepository {
  /**
   * @type {string}
   */
  #apiDomain;
  /**
   * @type {Object}
   */
  #reqOption;

  constructor(apiUsername, apiPassword, apiDomain) {
    super();

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
