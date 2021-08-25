class ModelIdNotExistException extends Error {
  constructor() {
    super('The data model has no ID');

    this.name = 'ModelIdNotExistError';
    this.isOperation = true;
    this.httpCode = 400;
  }
}

module.exports = ModelIdNotExistException;
