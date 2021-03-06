/**
 * Created by pooya on 2/14/22.
 */

const axios = require('axios');
const IServerApiRepository = require('~src/core/interface/iServerApiRepository');

const JobModel = require('~src/core/model/jobModel');
const PackageModel = require('~src/core/model/packageModel');
const IpInterfaceModel = require('~src/core/model/ipInterfaceModel');
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
        `http://${serverModel.hostIpAddress}:${serverModel.hostApiPort}/api/v1/proxy/generate`,
        {
          ip: model.ip,
          mask: model.mask,
          gateway: model.gateway,
          interface: model.interface,
          type: model.type,
          country: model.country,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.#apiToken,
          },
        },
      );

      const result = this._fillJobModel(response.data.data);

      return [null, result];
    } catch (error) {
      return this._errorHandler(error);
    }
  }

  async deleteIp(model, serverModel) {
    try {
      const response = await axios.delete(
        `http://${serverModel.hostIpAddress}:${serverModel.hostApiPort}/api/v1/proxy/ip`,
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

      const result = this._fillJobModel(response.data.data);

      return [null, result];
    } catch (error) {
      return this._errorHandler(error);
    }
  }

  async getAllPackageByUsername(username, filterModel, serverModel) {
    const params = {};
    if (typeof filterModel.type !== 'undefined') {
      params.type = filterModel.type;
    }
    if (typeof filterModel.country !== 'undefined') {
      params.country = filterModel.country;
    }
    if (typeof filterModel.status !== 'undefined') {
      params.status = filterModel.status;
    }

    try {
      const response = await axios.get(
        `http://${serverModel.hostIpAddress}:${serverModel.hostApiPort}/api/v1/instance/self/package/user/${username}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.#apiToken,
          },
          params,
        },
      );

      const result = response.data.data.map((v) => this._fillPackageModel(v));

      return [null, result];
    } catch (error) {
      return this._errorHandler(error);
    }
  }

  async syncPackageById(id, serverModel) {
    try {
      await axios.post(
        `http://${serverModel.hostIpAddress}:${serverModel.hostApiPort}/api/v1/instance/self/package/${id}/sync`,
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

  async addUser(model, serverModel) {
    try {
      await axios.post(
        `http://${serverModel.hostIpAddress}:${serverModel.hostApiPort}/api/v1/instance/self/user`,
        {
          username: model.username,
          password: model.password,
        },
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

  async changeUserPassword(username, password, serverModel) {
    try {
      await axios.put(
        `http://${serverModel.hostIpAddress}:${serverModel.hostApiPort}/api/v1/instance/self/user/${username}/password`,
        {
          password,
        },
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

  async changeUserStatus(username, isEnable, serverModel) {
    const status = isEnable ? 'enable' : 'disable';

    try {
      await axios.put(
        `http://${serverModel.hostIpAddress}:${serverModel.hostApiPort}/api/v1/instance/self/user/${username}/${status}`,
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

  async getAllInterfaceOfServer(serverModel) {
    try {
      const response = await axios.get(
        `http://${serverModel.hostIpAddress}:${serverModel.hostApiPort}/api/v1/instance/self/server/interface`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.#apiToken,
          },
        },
      );

      const result = response.data.data.map((v) => this._fillIpInterface(v));

      return [null, result];
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
    model.password = body['password'];
    model.ipList = body['ipList'];
    model.countIp = body['countIp'];
    model.type = body['type'];
    model.status = body['status'];
    model.country = body['country'];
    model.isEnable = body['isEnable'];
    model.renewalDate = body['renewalDate']
      ? this.#dateTime.gregorianDateWithTimezone(body['renewalDate'], 'YYYY-MM-DD')
      : null;
    model.expireDate = body['expireDate']
      ? this.#dateTime.gregorianDateWithTimezone(body['expireDate'], 'YYYY-MM-DD')
      : null;

    return model;
  }

  _fillIpInterface(body) {
    const model = new IpInterfaceModel();
    model.hostname = body.hostname;
    model.interfaceName = body.interfaceName;
    model.interfacePrefix = body.interfacePrefix;
    model.ipList = body.ipList;

    return model;
  }
}

module.exports = ProxyServerApiRepository;
