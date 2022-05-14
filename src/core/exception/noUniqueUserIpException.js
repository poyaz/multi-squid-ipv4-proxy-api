class NoUniqueUserIpException extends Error {
  constructor() {
    super('Not exist any unique ip for this user');

    this.name = 'NoUniqueUserIpError';
    this.isOperation = true;
    this.httpCode = 404;
  }
}

module.exports = NoUniqueUserIpException;
