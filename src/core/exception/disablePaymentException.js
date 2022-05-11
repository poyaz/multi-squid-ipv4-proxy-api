class DisablePaymentException extends Error {
  constructor() {
    super('Payment method hase been disabled.');

    this.name = 'DisablePaymentError';
    this.isOperation = true;
    this.httpCode = 400;
  }
}

module.exports = DisablePaymentException;
