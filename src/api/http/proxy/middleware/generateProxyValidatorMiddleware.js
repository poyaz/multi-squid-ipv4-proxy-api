/**
 * Created by pooya on 8/29/21.
 */

const JoiCountry = require('@meanie/joi-country');
JoiCountry.setValidCodes(require('~src/countryAlpha2.json'));

const Joi = require('joi').extend(JoiCountry);

const IHttpMiddleware = require('~src/api/interface/iHttpMiddleware');

const SchemaValidatorException = require('~src/core/exception/schemaValidatorException');

class GenerateProxyValidatorMiddleware extends IHttpMiddleware {
  #req;
  #res;

  constructor(req, res) {
    super();

    this.#req = req;
    this.#res = res;
  }

  async act() {
    const { body } = this.#req;

    const ipPattern = Joi.string()
      .ip({ version: ['ipv4'] })
      .required();
    const maskFormat = Joi.number().min(1).max(32);

    const schema = Joi.object({
      ip: ipPattern,
      mask: maskFormat.required(),
      gateway: ipPattern,
      interface: Joi.string().required(),
      type: Joi.string().valid('isp', 'dc').required(),
      country: Joi.country().required(),
    });

    const result = schema.validate(body);
    if (result.error) {
      throw new SchemaValidatorException(result.error);
    }
  }
}

module.exports = GenerateProxyValidatorMiddleware;
