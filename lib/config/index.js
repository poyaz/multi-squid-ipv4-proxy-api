/**
 * Created by pooya on 11/19/20.
 */

const yn = require('yn');
/**
 * @property get
 */
const config = require('config');

const IConfig = require('~interface/iConfig');

class Config extends IConfig {
  get(key) {
    return config.get(key);
  }

  getStr(key, optional) {
    const data = config.get(key);

    return !data ? optional : data.toString();
  }

  getBool(key, optional = null) {
    const data = config.get(key);

    return data === null ? optional : yn(data);
  }

  getNum(key, optional = null) {
    const data = config.get(key);

    return data === null ? optional : Number(data);
  }
}

module.exports = Config;
