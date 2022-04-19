/**
 * Created by pooya on 4/17/22.
 */

/**
 * @property {string} id
 * @property {number} count
 * @property {number} price
 * @property {number} expireDay
 * @property {Array<ExternalStoreModel>} externalStore
 * @property {boolean} isEnable
 * @property {Date} insertDate
 * @property {Date} updateDate
 * @property {Date} deleteDate
 */
class ProductModel {
  id = undefined;
  count = undefined;
  price = undefined;
  expireDay = undefined;
  externalStore = [];
  isEnable = undefined;
  insertDate = undefined;
  updateDate = undefined;
  deleteDate = undefined;
}

module.exports = ProductModel;
