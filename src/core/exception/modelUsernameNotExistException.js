class ModelUsernameNotExistException extends Error {
  constructor() {
    super('The data model has no username');

    this.name = 'ModelUsernameNotExistError';
    this.isOperation = true;
    this.httpCode = 400;
  }
}

module.exports = ModelUsernameNotExistException;
