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

    const startDateFormat = Joi.date().format('YYYY-MM-DD HH:mm:ss');
    const endDateFormat = Joi.date().format('YYYY-MM-DD HH:mm:ss').min(new Date());
    const urlList = Joi.array().items(Joi.string()).min(1);

    const schema = Joi.object({
      urls: urlList.required(),
      startDate: startDateFormat.required(),
      endDate: endDateFormat.required(),
    });

    const result = schema.validate(body);
    if (result.error) {
      throw new SchemaValidatorException(result.error);
    }
  }
}

module.exports = BlockUrlForUserValidationMiddleware;
