class DatabaseRollbackException extends Error {
  constructor(error, rollbackError) {
    super('Problem to rollback in database');

    this.name = 'DatabaseExecuteError';
    this.isOperation = false;
    this.httpCode = 400;
    this.errorInfo = error;
    this.rollbackErrorInfo = rollbackError;
  }
}

module.exports = DatabaseRollbackException;
