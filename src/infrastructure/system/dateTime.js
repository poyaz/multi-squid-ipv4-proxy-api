/**
 * Created by pooya on 12/21/20.
 */

const moment = require('moment-timezone');
const IDateTime = require('~src/core/interface/iDateTime');

class DateTime extends IDateTime {
  #locales = 'en';
  #zone = 'Asia/Tehran';

  constructor(locales, zone) {
    super();

    if (locales) {
      this.#locales = locales;
    }
    if (zone) {
      this.#zone = zone;
    }
  }

  get locales() {
    return this.#locales;
  }

  get zone() {
    return this.#zone;
  }

  /**
   *
   * @param {string} date
   * @param {string} [inputFormat='YYYY-MM-DD HH:mm:ss']
   * @return {Date}
   */
  gregorianDateWithTimezone(date, inputFormat = 'YYYY-MM-DD HH:mm:ss') {
    const dateObj = moment(date, inputFormat);

    return this._gregorianWithTimezone(dateObj).toDate();
  }

  /**
   *
   * @param {Date} date
   * @param {string} [format='YYYY-MM-DD HH:mm:ss']
   * @return {string}
   */
  gregorianWithTimezoneString(date, format = 'YYYY-MM-DD HH:mm:ss') {
    return this._gregorianWithTimezone(date).format(format);
  }

  /**
   *
   * @return {Date}
   */
  gregorianCurrentDateWithTimezone() {
    return new Date();
  }

  /**
   *
   * @param {string} [format='YYYY-MM-DD HH:mm:ss']
   * @return {string}
   */
  gregorianCurrentDateWithTimezoneString(format = 'YYYY-MM-DD HH:mm:ss') {
    return this._gregorianWithTimezone(new Date()).format(format);
  }

  /**
   *
   * @param {Date} date
   * @return {moment.Moment}
   * @private
   */
  _gregorianWithTimezone(date) {
    if (typeof date.getTimezoneOffset === 'function' && date.getTimezoneOffset() === 0) {
      return moment(date);
    }
    if (
      Object.hasOwnProperty.call(date, '_isAMomentObject') &&
      date['_d'].getTimezoneOffset() === 0
    ) {
      return moment(date);
    }

    return moment(date).tz(this.#zone);
  }
}

module.exports = DateTime;
