/**
 * Created by pooya on 2/24/21.
 */

class IHttpMiddleware {
  async act() {
    const error = new Error('The method has to be overridden by subclasses.');
    error['args'] = {};
    throw error;
  }
}

module.exports = IHttpMiddleware;
