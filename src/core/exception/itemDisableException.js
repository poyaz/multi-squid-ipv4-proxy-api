class ItemDisableException extends Error {
  constructor() {
    super('This item has been disabled.');

    this.name = 'ItemDisableError';
    this.isOperation = true;
    this.httpCode = 400;
  }
}

module.exports = ItemDisableException;
