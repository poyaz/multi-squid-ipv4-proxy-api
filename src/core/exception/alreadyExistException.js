class AlreadyExistException extends Error {
  constructor(existMessage) {
    super('The record already exist.');

    this.name = 'AlreadyExistError';
    this.isOperation = true;
    this.httpCode = 400;
    this.additionalInfo = [{ message: existMessage }];
  }
}

module.exports = AlreadyExistException;
