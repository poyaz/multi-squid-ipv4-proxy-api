/**
 * Created by pooya on 8/29/21.
 */

const jwt = require('jsonwebtoken');

const IRunner = require('~interface/iRunner');

class JwtUtil extends IRunner {
  /**
   *
   * @param {IConfig} config
   * @param {Object} options
   * @param {*} dependency
   */
  constructor(config, options, dependency) {
    super();

    this._config = config;
    this._options = options;
    this._cwd = options.cwd;
    this._dependency = dependency;
  }

  async start() {
    const secret = this._config.getStr('custom.jwt.secret');

    const sign = (data) => {
      return jwt.sign(data, secret, {});
    };

    const verify = (token) => {
      return jwt.verify(token, secret);
    };

    return { sign, verify };
  }
}

module.exports = JwtUtil;
