class FastspringAlreadyCanceledException extends Error {
  constructor(error) {
    super('The subscription is already canceled.');

    this.name = 'FastspringAlreadyCanceledError';
    this.isOperation = false;
    this.httpCode = 400;
    this.errorInfo = error;
  }
}

module.exports = FastspringAlreadyCanceledException;
