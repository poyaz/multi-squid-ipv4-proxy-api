class ExternalAuthException extends Error {
  constructor(error) {
    super('Problem in using external authenticate.');

    this.name = 'ExternalAuthError';
    this.isOperation = false;
    this.httpCode = 400;
    this.errorInfo = error;
  }
}

module.exports = ExternalAuthException;
