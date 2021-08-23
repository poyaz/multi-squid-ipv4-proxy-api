class UnknownException extends Error {
  constructor() {
    super('خطای ناشناخته در انجام عملیات');

    this.name = 'UnknownError';
    this.isOperation = true;
    this.httpCode = 400;
  }
}

module.exports = UnknownException;
