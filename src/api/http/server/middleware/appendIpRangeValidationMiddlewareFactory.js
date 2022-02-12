/**
 * Created by pooya on 2/12/22.
 */

const AppendIpRangeValidationMiddleware = require('./appendIpRangeValidationMiddleware');

class AppendIpRangeValidationMiddlewareFactory {
  create(req, res) {
    return new AppendIpRangeValidationMiddleware(req, res);
  }
}

module.exports = AppendIpRangeValidationMiddlewareFactory;
