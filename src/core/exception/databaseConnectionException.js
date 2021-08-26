class DatabaseConnectionException extends Error {
  constructor(error) {
    super(`Can't connect to database`);

    this.name = 'DatabaseConnectionError';
    this.isOperation = false;
    this.httpCode = 400;
    this.errorInfo = error;
  }
}

module.exports = DatabaseConnectionException;
