/**
 * Created by pooya on 11/30/20.
 */

const uuid = require('uuid').v4;
const IIdentifierGenerator = require('~src/core/interface/iIdentifierGenerator');

class IdentifierGenerator extends IIdentifierGenerator {
  generateId() {
    return uuid();
  }
}

module.exports = IdentifierGenerator;
