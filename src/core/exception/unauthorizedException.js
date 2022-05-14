class unauthorizedException extends Error {
  constructor(error) {
    super('Unauthorized access.');

    this.name = 'UnauthorizedError';
    this.isOperation = true;
    this.httpCode = 401;
    this.errorInfo = error;
  }
}

module.exports = unauthorizedException;
