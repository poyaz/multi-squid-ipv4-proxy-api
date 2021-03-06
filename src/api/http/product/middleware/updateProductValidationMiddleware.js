/**
 * Created by pooya on 4/17/22.
 */

const Joi = require('joi');

const IHttpMiddleware = require('~src/api/interface/iHttpMiddleware');

const SchemaValidatorException = require('~src/core/exception/schemaValidatorException');

class UpdateProductValidationMiddleware extends IHttpMiddleware {
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
      count: Joi.number().min(1).optional(),
      price: Joi.number().min(1).optional(),
      expireDay: Joi.number().min(1).optional(),
      isEnable: Joi.boolean().optional(),
    })
      .or('count', 'price', 'expireDay', 'isEnable')
      .required();

    const result = schema.validate(body);
    if (result.error) {
      throw new SchemaValidatorException(result.error);
    }
  }
}

module.exports = UpdateProductValidationMiddleware;
