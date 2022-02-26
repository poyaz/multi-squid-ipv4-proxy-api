class ApiCallException extends Error {
  constructor(error) {
    super('Problem call api.');

    this.name = 'ApiCallError';
    this.isOperation = false;
    this.httpCode = 400;
    this.errorInfo = error;
  }
}

module.exports = ApiCallException;
