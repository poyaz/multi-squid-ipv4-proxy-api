/**
 * Created by pooya on 8/29/21.
 */

const Joi = require('joi').extend(require('@joi/date'));

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
    });

    const result = schema.validate(body);
    if (result.error) {
      throw new SchemaValidatorException(result.error);
    }
  }
}

module.exports = GenerateProxyValidatorMiddleware;
