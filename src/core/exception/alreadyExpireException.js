class AlreadyExpireException extends Error {
  constructor() {
    super('This service already expired.');

    this.name = 'AlreadyExpireError';
    this.isOperation = true;
    this.httpCode = 400;
  }
}

module.exports = AlreadyExpireException;
