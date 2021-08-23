class NotFoundException extends Error {
  constructor() {
    super('رکورد موردنظر وجود ندارد');

    this.name = 'NotFoundError';
    this.isOperation = true;
    this.httpCode = 404;
  }
}

module.exports = NotFoundException;
