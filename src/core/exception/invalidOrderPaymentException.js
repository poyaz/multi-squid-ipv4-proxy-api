class InvalidOrderPaymentException extends Error {
  constructor() {
    super('Your order info is invalid!');

    this.name = 'InvalidOrderPaymentError';
    this.isOperation = true;
    this.httpCode = 400;
  }
}

module.exports = InvalidOrderPaymentException;
