/**
 * Created by pooya on 8/23/21.
 */

const Joi = require('joi').extend(require('@joi/date'));

const IHttpMiddleware = require('~src/api/interface/iHttpMiddleware');

const SchemaValidatorException = require('~src/core/exception/schemaValidatorException');

class BlockUrlForUserValidationMiddleware extends IHttpMiddleware {
  #req;
  #res;

  constructor(req, res) {
    super();

    this.#req = req;
    this.#res = res;
  }

  async act() {
    const { body } = this.#req;

    const dateFormat = Joi.date().format('YYYY-MM-DD HH:mm:ss').min(new Date());
    const urlList = Joi.array().items(Joi.string()).min(1);

    const schema = Joi.object({
      url: urlList.required(),
      startDate: dateFormat.required(),
      endDate: dateFormat.required(),
    });

    const result = schema.validate(body);
    if (result.error) {
      throw new SchemaValidatorException(result.error);
    }
  }
}

module.exports = BlockUrlForUserValidationMiddleware;
