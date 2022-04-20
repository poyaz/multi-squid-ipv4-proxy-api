class AlreadyExistException extends Error {
  constructor(existMessage) {
    super('The record already exist.');

    this.name = 'AlreadyExistError';
    this.isOperation = false;
    this.httpCode = 400;
    this.additionalInfo = [{ message: existMessage }];
  }
}

module.exports = AlreadyExistException;
