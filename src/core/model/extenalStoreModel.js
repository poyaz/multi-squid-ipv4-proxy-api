/**
 * Created by pooya on 4/19/22.
 */

/**
 * @property {string} id
 * @property {string} type
 * @property {string} serial
 * @property {Date} insertDate
 */
class ExternalStoreModel {
  static EXTERNAL_STORE_TYPE = 'fastspring';

  id = undefined;
  type = undefined;
  serial = undefined;
  insertDate = undefined;
}

module.exports = ExternalStoreModel;
