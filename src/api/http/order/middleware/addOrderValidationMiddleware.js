/**
 * Created by pooya on 4/30/22.
 */

const JoiCountry = require('@meanie/joi-country');
JoiCountry.setValidCodes(require('~src/countryAlpha2.json'));
const JoiDate = require('@joi/date');

const Joi = require('joi').extend(JoiDate).extend(JoiCountry);

const IHttpMiddleware = require('~src/api/interface/iHttpMiddleware');

const SchemaValidatorException = require('~src/core/exception/schemaValidatorException');

class AddOrderValidationMiddleware extends IHttpMiddleware {
  #req;
  #res;

  constructor(req, res) {
    super();

    this.#req = req;
    this.#res = res;
  }

  async act() {
    const { body } = this.#req;

    const schema = Joi.object({
      serviceName: Joi.string().required(),
      prePackageOrderInfo: Joi.object({
        count: Joi.number().min(1).required(),
        proxyType: Joi.string().valid('isp', 'dc').required(),
        countryCode: Joi.country().required(),
      }).required(),
    });

    const result = schema.validate(body);
    if (result.error) {
      throw new SchemaValidatorException(result.error);
    }
  }
}

module.exports = AddOrderValidationMiddleware;
