class UserExistException extends Error {
  constructor() {
    super('User exist in system');

    this.name = 'UserExistError';
    this.isOperation = true;
    this.httpCode = 400;
  }
}

module.exports = UserExistException;
