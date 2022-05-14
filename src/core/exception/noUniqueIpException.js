class NoUniqueIpException extends Error {
  constructor() {
    super('Not exist any unique ip');

    this.name = 'NoUniqueIpError';
    this.isOperation = true;
    this.httpCode = 404;
  }
}

module.exports = NoUniqueIpException;
