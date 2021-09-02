class NoUniqueIpException extends Error {
  constructor() {
    super('Not exist unique ip for create package for user');

    this.name = 'NoUniqueIpError';
    this.isOperation = true;
    this.httpCode = 404;
  }
}

module.exports = NoUniqueIpException;
