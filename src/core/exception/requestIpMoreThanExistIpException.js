class RequestIpMoreThanExistIpException extends Error {
  constructor() {
    super('Your request ip more than total ip exist in system or can collect by user');

    this.name = 'RequestIpMoreThanExistIpError';
    this.isOperation = true;
    this.httpCode = 400;
  }
}

module.exports = RequestIpMoreThanExistIpException;
