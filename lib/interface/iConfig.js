/**
 * Created by pooya on 11/19/20.
 */

class IConfig {
  /**
   *
   * @param {String} key
   * @return {*}
   */
  get(key) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { key };
    throw error;
  }

  /**
   *
   * @param {String} key
   * @param {String=} optional
   * @return {String}
   */
  getStr(key, optional) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { key, optional };
    throw error;
  }

  /**
   *
   * @param {String} key
   * @param {Boolean=} optional
   * @return {Boolean}
   */
  getBool(key, optional = null) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { key, optional };
    throw error;
  }

  /**
   *
   * @param {String} key
   * @param {Number=} optional
   * @return {Number}
   */
  getNum(key, optional = null) {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { key, optional };
    throw error;
  }
}

module.exports = IConfig;
