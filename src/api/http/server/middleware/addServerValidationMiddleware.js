/**
 * Created by pooya on 2/12/22.
 */

const Joi = require('joi');

const IHttpMiddleware = require('~src/api/interface/iHttpMiddleware');

const SchemaValidatorException = require('~src/core/exception/schemaValidatorException');

class AddServerValidationMiddleware extends IHttpMiddleware {
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
      name: Joi.string().min(3).required(),
      ipRange: Joi.array()
        .items(
          Joi.string()
            .ip({ version: ['ipv4'], cidr: 'required' })
            .required(),
        )
        .min(1)
        .required(),
      hostIpAddress: Joi.alternatives()
        .try(Joi.string().ip({ version: ['ipv4'], cidr: 'forbidden' }), Joi.string().domain())
        .required(),
      hostApiPort: Joi.number().required(),
    });

    const result = schema.validate(body);
    if (result.error) {
      throw new SchemaValidatorException(result.error);
    }
  }
}

module.exports = AddServerValidationMiddleware;
