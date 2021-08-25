/**
 * Created by pooya on 8/23/21.
 */

const Joi = require('joi').extend(require('@joi/date'));

const IHttpMiddleware = require('~src/api/interface/iHttpMiddleware');

const SchemaValidatorException = require('~src/core/exception/schemaValidatorException');

class CreatePackageValidationMiddleware extends IHttpMiddleware {
  #req;
  #res;

  constructor(req, res) {
    super();

    this.#req = req;
    this.#res = res;
  }

  async act() {
    const { body } = this.#req;

    const usernamePattern = Joi.string()
      .regex(/^[a-zA-Z0-9_.]{3,20}/)
      .required();
    const dateFormat = Joi.date().format('YYYY-MM-DD').min(new Date());

    const schema = Joi.object({
      username: usernamePattern,
      count: Joi.number().min(1).required(),
      expire: dateFormat.required(),
    });

    const result = schema.validate(body);
    if (result.error) {
      throw new SchemaValidatorException(result.error);
    }
  }
}

module.exports = CreatePackageValidationMiddleware;
