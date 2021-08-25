/**
 * Created by pooya on 8/23/21.
 */

class IDateTime {
  /**
   *
   * @param {string} date
   * @param {string} [inputFormat='YYYY-MM-DD HH:mm:ss']
   * @return {Date}
   */
  gregorianDateWithTimezone(date, inputFormat = 'YYYY-MM-DD HH:mm:ss') {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { date, inputFormat };
    throw error;
  }

  /**
   *
   * @param {Date} date
   * @param {string} [format='YYYY-MM-DD HH:mm:ss']
   * @return {string}
   */
  gregorianWithTimezoneString(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { date, format };
    throw error;
  }

  /**
   *
   * @return {Date}
   */
  gregorianCurrentDateWithTimezone() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
    throw error;
  }

  /**
   *
   * @param {string} [format='YYYY-MM-DD HH:mm:ss']
   * @return {string}
   */
  gregorianCurrentDateWithTimezoneString(format = 'YYYY-MM-DD HH:mm:ss') {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = { format };
    throw error;
  }
}

module.exports = IDateTime;
