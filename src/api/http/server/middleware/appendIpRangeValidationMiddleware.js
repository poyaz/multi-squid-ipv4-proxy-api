/**
 * Created by pooya on 2/12/22.
 */

const Joi = require('joi');

const IHttpMiddleware = require('~src/api/interface/iHttpMiddleware');

const SchemaValidatorException = require('~src/core/exception/schemaValidatorException');

class AppendIpRangeValidationMiddleware extends IHttpMiddleware {
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
      ipRange: Joi.array()
        .items(
          Joi.string()
            .ip({ version: ['ipv4'], cidr: 'required' })
            .required(),
        )
        .min(1)
        .required(),
    });

    const result = schema.validate(body);
    if (result.error) {
      throw new SchemaValidatorException(result.error);
    }
  }
}

module.exports = AppendIpRangeValidationMiddleware;
