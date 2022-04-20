/**
 * Created by pooya on 4/17/22.
 */

const Joi = require('joi');

const IHttpMiddleware = require('~src/api/interface/iHttpMiddleware');

const SchemaValidatorException = require('~src/core/exception/schemaValidatorException');

const ExternalStoreModel = require('~src/core/model/externalStoreModel');

class UpdateExternalStoreValidationMiddleware extends IHttpMiddleware {
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
      type: Joi.string().valid(ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING).optional(),
      serial: Joi.string().optional(),
    })
      .or('type', 'serial')
      .required();

    const result = schema.validate(body);
    if (result.error) {
      throw new SchemaValidatorException(result.error);
    }
  }
}

module.exports = UpdateExternalStoreValidationMiddleware;
