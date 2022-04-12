/**
 * Created by pooya on 8/23/21.
 */

const JoiCountry = require('@meanie/joi-country');
JoiCountry.setValidCodes(require('~src/countryAlpha2.json'));
const JoiDate = require('@joi/date');

const Joi = require('joi').extend(JoiDate).extend(JoiCountry);

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
      type: Joi.string().valid('isp', 'dc').required(),
      country: Joi.country().required(),
      expire: dateFormat.required(),
    });

    const result = schema.validate(body);
    if (result.error) {
      throw new SchemaValidatorException(result.error);
    }
  }
}

module.exports = CreatePackageValidationMiddleware;
