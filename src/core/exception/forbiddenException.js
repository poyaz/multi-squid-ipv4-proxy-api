class ForbiddenException extends Error {
  constructor(error) {
    super('Forbidden access.');

    this.name = 'ForbiddenError';
    this.isOperation = false;
    this.httpCode = 403;
    this.errorInfo = error;
  }
}

module.exports = ForbiddenException;
