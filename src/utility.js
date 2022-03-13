/**
 * Created by pooya on 12/19/20.
 */

class Utility {
  static singleLine(strings) {
    const values = Array.prototype.slice.call(arguments, 1);

    // Interweave the strings with the
    // substitution vars first.
    let output = '';
    for (let i = 0; i < values.length; i++) {
      output += strings[i] + values[i];
    }

    output += strings[values.length];

    // Split on newlines.
    const lines = output.split(/(?:\r\n|\n|\r)/);

    // Rip out the leading whitespace.
    return lines
      .map((line) => line.replace(/^\s+/gm, ''))
      .filter((line) => !line.match(/^--/))
      .join(' ')
      .trim();
  }

  /**
   *
   * @param {number} val
   * @return {boolean}
   */
  static sqliteConvertIntToBoolean(val) {
    return Boolean(val);
  }

  /**
   *
   * @param {boolean} val
   * @return {number}
   */
  static sqliteConvertBooleanToInt(val) {
    return val ? 1 : 0;
  }

  /**
   *
   * @param {Error} error
   * @return {string}
   */
  static convertErrorToJson(error) {
    const propertyNames = Object.getOwnPropertyNames(error);
    const errorObj = {};
    for (let i = 0; i < propertyNames.length; i++) {
      const property = propertyNames[i];
      const descriptor = Object.getOwnPropertyDescriptor(error, property);
      errorObj[property] = descriptor.value;
    }

    return JSON.stringify(errorObj);
  }

  /**
   *
   * @param {string} host
   * @param {number} httpPort
   * @param {number} httpsPort
   * @param {boolean} force
   * @return {string}
   */
  static hostBuilder(host, httpPort, httpsPort, force) {
    let protocol;
    let port;

    if (force && httpsPort) {
      protocol = 'https://';
      port = httpsPort !== 443 ? `:${httpsPort}` : '';
    } else {
      protocol = 'http://';
      port = httpPort !== 80 ? `:${httpPort}` : '';
    }

    return `${protocol}${host}${port}`;
  }
}

module.exports = Utility;
