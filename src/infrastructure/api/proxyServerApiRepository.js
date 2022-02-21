/**
 * Created by pooya on 2/14/22.
 */

const axios = require('axios');
const IServerApiRepository = require('~src/core/interface/iServerApiRepository');

const JobModel = require('~src/core/model/jobModel');
const PackageModel = require('~src/core/model/packageModel');
const UnknownException = require('~src/core/exception/unknownException');
const ApiCallException = require('~src/core/exception/apiCallException');
const NotFoundException = require('~src/core/exception/notFoundException');
const UnauthorizedException = require('~src/core/exception/unauthorizedException');
const ForbiddenException = require('~src/core/exception/forbiddenException');
const SchemaValidatorException = require('~src/core/exception/schemaValidatorException');

class ProxyServerApiRepository extends IServerApiRepository {
  /**
   * @type IDateTime
   */
  #dateTime;
  /**
   * @type string
   */
  #apiToken;

  /**
   *
   * @param {IDateTime} dateTime
   * @param {string} apiToken
   */
  constructor(dateTime, apiToken) {
    super();

    this.#dateTime = dateTime;
    this.#apiToken = apiToken;
  }

  async generateIp(model, serverModel) {
    try {
      const response = await axios.post(
        `${serverModel.hostIpAddress}:${serverModel.hostApiPort}/api/v1/proxy/generate`,
        {
          ip: model.ip,
          mask: model.mask,
          gateway: model.gateway,
          interface: model.interface,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.#apiToken,
          },
        },
      );

      const result = this._fillJobModel(response.data);

      return [null, result];
    } catch (error) {
      return this._errorHandler(error);
    }
  }

  async deleteIp(model, serverModel) {
    try {
      const response = await axios.delete(
        `${serverModel.hostIpAddress}:${serverModel.hostApiPort}/api/v1/proxy/ip`,
        {
          data: {
            ip: model.ip,
            mask: model.mask,
            interface: model.interface,
          },
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.#apiToken,
          },
        },
      );

      const result = this._fillJobModel(response.data);

      return [null, result];
    } catch (error) {
      return this._errorHandler(error);
    }
  }

  async getAllPackageByUsername(username, serverModel) {
    try {
      const response = await axios.get(
        `${serverModel.hostIpAddress}:${serverModel.hostApiPort}/api/v1/instance/self/package/user/${username}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.#apiToken,
          },
        },
      );

      const result = response.data.map((v) => this._fillPackageModel(v));

      return [null, result];
    } catch (error) {
      return this._errorHandler(error);
    }
  }

  async syncPackageById(id, serverModel) {
    try {
      await axios.post(
        `${serverModel.hostIpAddress}:${serverModel.hostApiPort}/api/v1/package/${id}/sync`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.#apiToken,
          },
        },
      );

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
      switch (error.response.data.name) {
        case 'SchemaValidatorError': {
          const e = new Error(error.response.data.error);
          e.details = error.response.data.additionalInfo;

          return [new SchemaValidatorException(e)];
        }
        default:
          return [new UnknownException()];
      }
    } else if (error.request) {
      return [new ApiCallException()];
    } else {
      return [new ApiCallException()];
    }
  }

  _fillJobModel(body) {
    const model = new JobModel();
    model.id = body['jobId'];

    return model;
  }

  _fillPackageModel(body) {
    const model = new PackageModel();
    model.id = body['id'];
    model.username = body['username'];
    model.countIp = body['countIp'];
    model.expireDate = body['expireDate']
      ? this.#dateTime.gregorianDateWithTimezone(body['expireDate'], 'YYYY-MM-DD')
      : null;

    return model;
  }
}

module.exports = ProxyServerApiRepository;
