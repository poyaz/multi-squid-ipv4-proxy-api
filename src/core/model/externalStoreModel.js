/**
 * Created by pooya on 4/19/22.
 */

/**
 * @property {string} id
 * @property {string} productId
 * @property {string} type
 * @property {string} serial
 * @property {Array<{value: number, unit: string, country: string}>} price
 * @property {Date} insertDate
 */
class ExternalStoreModel {
  static EXTERNAL_STORE_TYPE_FASTSPRING = 'fastspring';

  id = undefined;
  productId = undefined;
  type = undefined;
  serial = undefined;
  price = [];
  insertDate = undefined;
}

module.exports = ExternalStoreModel;
