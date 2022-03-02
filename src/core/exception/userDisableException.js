class UserDisableException extends Error {
  constructor(error) {
    super('Your username has been disable. Please contact with admin');

    this.name = 'UserDisableError';
    this.isOperation = false;
    this.httpCode = 400;
    this.errorInfo = error;
  }
}

module.exports = UserDisableException;
