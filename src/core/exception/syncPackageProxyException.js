class SyncPackageProxyException extends Error {
  constructor() {
    super('Can not sync package proxy in all server');

    this.name = 'SyncPackageProxyError';
    this.isOperation = true;
    this.httpCode = 400;
  }
}

module.exports = SyncPackageProxyException;
