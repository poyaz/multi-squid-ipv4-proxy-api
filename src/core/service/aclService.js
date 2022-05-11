/**
 * Created by pooya on 5/11/22.
 */

const IAclService = require('~src/core/interface/iAclService');
const ForbiddenException = require('~src/core/exception/forbiddenException');

class AclService extends IAclService {
  /**
   * @type {IPackageRepository}
   */
  #packageRepository;
  /**
   * @type {IOrderRepository}
   */
  #orderRepository;

  /**
   *
   * @param {IPackageRepository} packageRepository
   * @param {IOrderRepository} orderRepository
   */
  constructor(packageRepository, orderRepository) {
    super();

    this.#packageRepository = packageRepository;
    this.#orderRepository = orderRepository;
  }

  async isAccessToUrl(userData, params) {
    let userId;
    let username;

    switch (true) {
      case Object.hasOwnProperty.call(params, 'userId'): {
        userId = params.userId;
        break;
      }
      case Object.hasOwnProperty.call(params, 'username'): {
        username = params.username;
        break;
      }
      case Object.hasOwnProperty.call(params, 'packageId'): {
        const [error, data] = await this.#packageRepository.getById(params.packageId);
        if (error) {
          return [error];
        }
        if (!data) {
          return [null];
        }

        userId = data.userId;

        break;
      }
      case Object.hasOwnProperty.call(params, 'orderId'): {
        const [error, data] = await this.#orderRepository.getById(params.orderId);
        if (error) {
          return [error];
        }
        if (!data) {
          return [null];
        }

        userId = data.userId;

        break;
      }
    }

    if (userId && userId !== userData.id) {
      return [new ForbiddenException()];
    }
    if (username && username !== userData.username) {
      return [new ForbiddenException()];
    }

    return [null];
  }
}

module.exports = AclService;
