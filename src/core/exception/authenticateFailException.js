class AuthenticateFailException extends Error {
  constructor(error) {
    super('Username or password has incorrect.');

    this.name = 'AuthenticateFailError';
    this.isOperation = false;
    this.httpCode = 400;
    this.errorInfo = error;
  }
}

module.exports = AuthenticateFailException;
