class CommandExecuteException extends Error {
  constructor(error) {
    super('Problem executing command in the system.');

    this.name = 'CommandExecuteError';
    this.isOperation = false;
    this.httpCode = 400;
    this.errorInfo = error;
  }
}

module.exports = CommandExecuteException;
