class DatabaseExecuteException extends Error {
  constructor(error) {
    super('Problem executing query in the database.');

    this.name = 'DatabaseExecuteError';
    this.isOperation = false;
    this.httpCode = 400;
    this.errorInfo = error;
  }
}

module.exports = DatabaseExecuteException;
