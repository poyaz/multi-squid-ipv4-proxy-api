class NotFoundException extends Error {
  constructor() {
    super('Record not found.');

    this.name = 'NotFoundError';
    this.isOperation = true;
    this.httpCode = 404;
  }
}

module.exports = NotFoundException;
