/**
 * Created by pooya on 4/17/22.
 */

const Joi = require('joi');

const IHttpMiddleware = require('~src/api/interface/iHttpMiddleware');

const SchemaValidatorException = require('~src/core/exception/schemaValidatorException');

const ExternalStoreModel = require('~src/core/model/externalStoreModel');

class AddProductValidationMiddleware extends IHttpMiddleware {
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
      count: Joi.number().min(1).required(),
      price: Joi.number().min(1).required(),
      expireDay: Joi.number().min(1).required(),
      externalStore: Joi.array()
        .items(
          Joi.object({
            type: Joi.string().valid(ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING).required(),
            serial: Joi.string().required(),
          }),
        )
        .optional(),
      isEnable: Joi.boolean().required(),
    });

    const result = schema.validate(body);
    if (result.error) {
      throw new SchemaValidatorException(result.error);
    }
  }
}

module.exports = AddProductValidationMiddleware;
