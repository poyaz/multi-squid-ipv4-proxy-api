class DatabaseMinParamUpdateException extends Error {
  constructor() {
    super('Problem running the update query due to the lack of a minimum field for the update.');

    this.name = 'DatabaseMinParamUpdateError';
    this.isOperation = true;
    this.httpCode = 400;
  }
}

module.exports = DatabaseMinParamUpdateException;
