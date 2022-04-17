/**
 * Created by pooya on 4/17/22.
 */

const { singleLine } = require('~src/utility');
const IProductRepository = require('~src/core/interface/iProductRepository');

const ProductModel = require('~src/core/model/productModel');
const ModelIdNotExistException = require('~src/core/exception/modelIdNotExistException');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');
const DatabaseMinParamUpdateException = require('~src/core/exception/databaseMinParamUpdateException');

class ProductPgRepository extends IProductRepository {
  #db;
  /**
   * @type {IDateTime}
   */
  #dateTime;
  /**
   * @type {IIdentifierGenerator}
   */
  #identifierGenerator;

  /**
   *
   * @param db
   * @param {IDateTime} dateTime
   * @param {IIdentifierGenerator} identifierGenerator
   */
  constructor(db, dateTime, identifierGenerator) {
    super();

    this.#db = db;
    this.#dateTime = dateTime;
    this.#identifierGenerator = identifierGenerator;
  }

  async getAll(filterModel) {
    const filterConditions = [];
    const getAllQuery = {
      text: singleLine`
          SELECT *
          FROM public.product
          WHERE delete_date ISNULL
      `,
      values: [],
    };

    if (typeof filterModel.isEnable !== 'undefined') {
      getAllQuery.values.push(filterModel.isEnable);
      filterConditions.push(`is_enable = $${getAllQuery.values.length}`);
    }

    if (filterConditions.length > 0) {
      getAllQuery.text += ` AND ${filterConditions.join(' AND ')}`;
    }

    try {
      const { rowCount, rows } = await this.#db.query(getAllQuery);
      if (rowCount === 0) {
        return [null, []];
      }

      const result = rows.map((v) => this._fillModel(v));

      return [null, result];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  async getById(id) {
    const getAllQuery = {
      text: singleLine`
          SELECT *
          FROM public.product
          WHERE delete_date ISNULL
            AND id = $1
      `,
      values: [id],
    };

    try {
      const { rowCount, rows } = await this.#db.query(getAllQuery);
      if (rowCount === 0) {
        return [null, null];
      }

      const result = this._fillModel(rows[0]);

      return [null, result];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  async add(model) {
    const id = this.#identifierGenerator.generateId();
    const now = this.#dateTime.gregorianCurrentDateWithTimezoneString();

    const addQuery = {
      text: singleLine`
          INSERT INTO public.product (id, count, price, expire_day, is_enable, insert_date)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
      `,
      values: [id, model.count, model.price, model.expireDay, model.isEnable, now],
    };

    try {
      const { rows } = await this.#db.query(addQuery);

      const result = this._fillModel(rows[0]);

      return [null, result];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  async update(model) {
    if (typeof model.id === 'undefined') {
      return [new ModelIdNotExistException()];
    }

    const columns = [];
    /**
     * @type {Array<*>}
     */
    const params = [model.id];

    if (typeof model.count !== 'undefined') {
      params.push(model.count);
      columns.push(`count = $${params.length}`);
    }
    if (typeof model.price !== 'undefined') {
      params.push(model.price);
      columns.push(`price = $${params.length}`);
    }
    if (typeof model.expireDay !== 'undefined') {
      params.push(model.expireDay);
      columns.push(`expire_day = $${params.length}`);
    }
    if (typeof model.isEnable !== 'undefined') {
      params.push(model.isEnable);
      columns.push(`is_enable = $${params.length}`);
    }

    if (columns.length === 0) {
      return [new DatabaseMinParamUpdateException()];
    }

    params.push(this.#dateTime.gregorianCurrentDateWithTimezoneString());
    columns.push(`update_date = $${params.length}`);

    const updateQuery = {
      text: singleLine`
          UPDATE public.product
          SET ${columns.join(', ')}
          WHERE delete_date ISNULL
            AND id = $1
      `,
      values: [...params],
    };

    try {
      await this.#db.query(updateQuery);

      return [null];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  _fillModel(row) {
    const model = new ProductModel();
    model.id = row['id'];
    model.count = row['count'];
    model.price = row['price'];
    model.expireDay = row['expire_day'];
    model.isEnable = row['is_enable'];
    model.insertDate = this.#dateTime.gregorianDateWithTimezone(row['insert_date']);
    model.updateDate = row['update_date']
      ? this.#dateTime.gregorianDateWithTimezone(row['update_date'])
      : null;

    return model;
  }
}

module.exports = ProductPgRepository;
