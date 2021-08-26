class ExpireDateException extends Error {
  constructor() {
    super('Field expireDate not valid.');

    this.name = 'ExpireDateError';
    this.isOperation = true;
    this.httpCode = 400;
  }
}

module.exports = ExpireDateException;
