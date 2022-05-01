class PaymentServiceMatchException extends Error {
  constructor(error) {
    super('Your payment service name not match with whitelist');

    this.name = 'PaymentServiceMatchError';
    this.isOperation = true;
    this.httpCode = 400;
    this.errorInfo = error;
  }
}

module.exports = PaymentServiceMatchException;
