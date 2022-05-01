class PaymentDataMatchException extends Error {
  constructor(error) {
    super('Your payment data event not valid');

    this.name = 'PaymentDataMatchError';
    this.isOperation = true;
    this.httpCode = 400;
    this.errorInfo = error;
  }
}

module.exports = PaymentDataMatchException;
