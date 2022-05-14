class InvalidAuthorizationHeaderException extends Error {
  constructor(error) {
    super('Your authorization header is invalid format.');

    this.name = 'InvalidAuthorizationHeaderError';
    this.isOperation = true;
    this.httpCode = 400;
    this.errorInfo = error;
  }
}

module.exports = InvalidAuthorizationHeaderException;
