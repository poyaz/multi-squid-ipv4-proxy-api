class UnknownException extends Error {
  constructor() {
    super('Unknown error in operation.');

    this.name = 'UnknownError';
    this.isOperation = false;
    this.httpCode = 400;
  }
}

module.exports = UnknownException;
