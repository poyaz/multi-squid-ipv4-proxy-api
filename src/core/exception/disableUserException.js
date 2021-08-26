class DisableUserException extends Error {
  constructor() {
    super('Username have been disabled.');

    this.name = 'DisableUserError';
    this.isOperation = true;
    this.httpCode = 400;
  }
}

module.exports = DisableUserException;
