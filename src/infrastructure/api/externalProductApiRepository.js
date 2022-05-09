/**
 * Created by pooya on 5/8/22.
 */

const IProductRepository = require('~src/core/interface/iProductRepository');
const ExternalStoreModel = require('~src/core/model/externalStoreModel');

class ExternalProductApiRepository extends IProductRepository {
  /**
   * @type {IProductRepository}
   */
  #productRepository;
  /**
   * @type {IFastspringApiRepository}
   */
  #fastspringApiRepository;

  /**
   *
   * @param {IProductRepository} productRepository
   * @param {IFastspringApiRepository} fastspringApiRepository
   */
  constructor(productRepository, fastspringApiRepository) {
    super();

    this.#productRepository = productRepository;
    this.#fastspringApiRepository = fastspringApiRepository;
  }

  async getAll(filterModel) {
    const [getAllError, getAllData] = await this.#productRepository.getAll(filterModel);
    if (getAllError) {
      return [getAllError];
    }

    const getPriceDataList = this._getListOfProductNeedFetchPrice(getAllData);
    if (getPriceDataList.length === 0) {
      return [null, getAllData];
    }

    await this._getProductPriceFromExternalStore(getPriceDataList);

    return [null, getAllData];
  }

  async getById(id) {
    const [getByIdError, getByIdData] = await this.#productRepository.getById(id);
    if (getByIdError) {
      return [getByIdError];
    }

    const getPriceDataList = this._getListOfProductNeedFetchPrice([getByIdData]);
    if (getPriceDataList.length === 0) {
      return [null, getByIdData];
    }

    await this._getProductPriceFromExternalStore(getPriceDataList);

    return [null, getByIdData];
  }

  async add(model) {
    const [addError, addData] = await this.#productRepository.add(model);
    if (addError) {
      return [addError];
    }

    const getPriceDataList = this._getListOfProductNeedFetchPrice([addData]);
    if (getPriceDataList.length === 0) {
      return [null, addData];
    }

    await this._getProductPriceFromExternalStore(getPriceDataList);

    return [null, addData];
  }

  async upsertExternalProductPrice(model) {
    return this.#productRepository.upsertExternalProductPrice(model);
  }

  async update(model) {
    return this.#productRepository.update(model);
  }

  async updateExternalStore(model) {
    return this.#productRepository.updateExternalStore(model);
  }

  async delete(id) {
    return this.#productRepository.delete(id);
  }

  async deleteExternalStore(productId, externalStoreId) {
    return this.#productRepository.deleteExternalStore(productId, externalStoreId);
  }

  /**
   *
   * @param {Array<ProductModel>} productList
   * @return {Array<ExternalStoreModel>}
   * @private
   */
  _getListOfProductNeedFetchPrice(productList) {
    const data = productList
      .filter(
        (n) =>
          n.externalStore.findIndex(
            (m) => m.type === ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
          ) > -1,
      )
      .map((v) =>
        v.externalStore.find((m) => m.type === ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING),
      )
      .filter((v) => v.price.length === 0);

    return data.length > 0 ? data : [];
  }

  /**
   *
   * @param {Array<ExternalStoreModel>} externalStoreList
   * @return {Promise<void>}
   * @private
   */
  async _getProductPriceFromExternalStore(externalStoreList) {
    const fetchTasks = externalStoreList.map((v) =>
      this.#fastspringApiRepository.getProductPrice(v.serial),
    );
    const addTasks = [];

    const fetchTasksResult = await Promise.all(fetchTasks);
    for (let i = 0; i < fetchTasksResult.length; i++) {
      const [getPriceError, getPriceData] = fetchTasksResult[i];
      if (getPriceError) {
        console.error('Fetch price', getPriceError);
      }

      if (getPriceData) {
        const externalStoreData = externalStoreList.find((v) => v.serial === getPriceData.serial);
        externalStoreData.price = getPriceData.price;

        addTasks.push(this.#productRepository.upsertExternalProductPrice(externalStoreData));
      }
    }

    this._addProductPriceToExternalStoreOnBackground(addTasks);
  }

  _addProductPriceToExternalStoreOnBackground(addTasks) {
    if (addTasks.length === 0) {
      return;
    }

    Promise.all(addTasks)
      .then((addTasksResult) => {
        for (let i = 0; i < addTasksResult.length; i++) {
          const [addPriceError] = addTasksResult[i];
          if (addPriceError) {
            console.error('Upsert price', addPriceError);
          }
        }

        return true;
      })
      .catch((error) => console.error('Upsert price', error));
  }
}

module.exports = ExternalProductApiRepository;
