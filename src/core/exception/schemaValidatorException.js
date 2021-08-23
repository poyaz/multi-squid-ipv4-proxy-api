class SchemaValidatorException extends Error {
  constructor(error) {
    super('The submitted data is not valid.');

    this.name = ' SchemaValidatorError';
    this.isOperation = true;
    this.httpCode = 400;
    this.additionalInfo = this._parseErrors(error.details);
  }

  _parseErrors(errors) {
    if (!errors) {
      return [];
    }

    return errors.filter((v) => v.message !== 'ignore').map((v) => ({ message: v.message }));
    // .reduce((acc, current) => {
    //   const x = acc.find(
    //     (item) => item.message === current.message && item.path === current.path,
    //   );
    //   if (!x) {
    //     return acc.concat([current]);
    //   }
    //
    //   return acc;
    // }, []);
  }
}

module.exports = SchemaValidatorException;
