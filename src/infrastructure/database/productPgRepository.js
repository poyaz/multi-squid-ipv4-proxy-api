/**
 * Created by pooya on 4/17/22.
 */

const { singleLine } = require('~src/utility');
const IProductRepository = require('~src/core/interface/iProductRepository');

const ProductModel = require('~src/core/model/productModel');
const ExternalStoreModel = require('~src/core/model/externalStoreModel');
const AlreadyExistException = require('~src/core/exception/alreadyExistException');
const ModelIdNotExistException = require('~src/core/exception/modelIdNotExistException');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');
const DatabaseRollbackException = require('~src/core/exception/databaseRollbackException');
const DatabaseConnectionException = require('~src/core/exception/databaseConnectionException');
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
          SELECT p.*,
                 es.id                         AS external_store_id,
                 es.type                       AS external_store_type,
                 es.serial                     AS external_store_serial,
                 es.insert_date                AS external_store_insert_date,
                 jsonb_agg(jsonb_build_object('unit', epp.unit, 'country', epp.country, 'value',
                                              epp.price))
                 FILTER (WHERE epp.id NOTNULL) AS external_store_price
          FROM public.product p
                   LEFT JOIN public.external_store es
                             ON p.id = es.product_id AND es.delete_date ISNULL
                   LEFT JOIN public.external_product_price epp
                             ON es.id = epp.external_store_id AND epp.delete_date ISNULL
          WHERE p.delete_date ISNULL
          GROUP BY p.id, p.count, p.price, p.expire_day, p.is_enable, p.insert_date, p.update_date,
                   p.delete_date, es.id, es.type, es.id, es.serial, es.insert_date
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

      const result = [];
      rows.map((v) => this._fillModel(result, v));

      return [null, result];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  async getById(id) {
    const getByIdQuery = {
      text: singleLine`
          SELECT p.*,
                 es.id                                                                  AS external_store_id,
                 es.type                                                                AS external_store_type,
                 es.serial                                                              AS external_store_serial,
                 es.insert_date                                                         AS external_store_insert_date,
                 jsonb_agg(jsonb_build_object('unit', epp.unit, 'country', epp.country, 'value',
                                              epp.price))
                 FILTER (WHERE epp.id NOTNULL)                                          AS external_store_price
          FROM public.product p
                   LEFT JOIN public.external_store es
                             ON p.id = es.product_id AND es.delete_date ISNULL
                   LEFT JOIN public.external_product_price epp
                             ON es.id = epp.external_store_id AND epp.delete_date ISNULL
          WHERE p.delete_date ISNULL
            AND p.id = $1
          GROUP BY p.id, p.count, p.price, p.expire_day, p.is_enable, p.insert_date, p.update_date,
                   p.delete_date, es.id, es.type, es.id, es.serial, es.insert_date
      `,
      values: [id],
    };

    try {
      const { rowCount, rows } = await this.#db.query(getByIdQuery);
      if (rowCount === 0) {
        return [null, null];
      }

      const result = [];
      this._fillModel(result, rows[0]);

      return [null, result[0]];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  async add(model) {
    const [errorClient, client] = await this._getDatabaseClient();
    if (errorClient) {
      return [errorClient];
    }

    const id = this.#identifierGenerator.generateId();
    const now = this.#dateTime.gregorianCurrentDateWithTimezoneString();

    const addProductQuery = {
      text: singleLine`
          INSERT INTO public.product (id, count, price, expire_day, is_enable, insert_date)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
      `,
      values: [id, model.count, model.price, model.expireDay, model.isEnable, now],
    };

    const addExternalStoreRecordList = model.externalStore.map((v) => ({
      id: this.#identifierGenerator.generateId(),
      type: v.type,
      serial: v.serial,
    }));
    const addExternalStoreQuery = {
      text: singleLine`
          INSERT INTO public.external_store (id, product_id, type, serial, insert_date)
          SELECT id,
                 $1,
                 type,
                 serial,
                 $2
          FROM json_to_recordset($3) as (id uuid, type varchar(50), serial varchar(200))
          RETURNING id AS external_store_id, type AS external_store_type, serial AS external_store_serial, insert_date AS external_store_insert_date
      `,
      values: [id, now, JSON.stringify(addExternalStoreRecordList)],
    };

    const transaction = { isStart: false };
    try {
      await client.query(`BEGIN`);
      transaction.isStart = true;

      const { rows: productRows } = await client.query(addProductQuery);

      if (model.externalStore.length > 0) {
        const { rows: externalStoreRows } = await client.query(addExternalStoreQuery);

        productRows[0] = { ...productRows[0], ...externalStoreRows[0] };
      }

      await client.query('END');

      const result = [];
      this._fillModel(result, productRows[0]);

      return [null, result[0]];
    } catch (executeError) {
      return [await this._rollbackOnError(client, executeError, transaction.isStart)];
    } finally {
      client.release();
    }
  }

  async upsertExternalProductPrice(model) {
    if (model.price.length === 0) {
      return [null, model];
    }

    const now = this.#dateTime.gregorianCurrentDateWithTimezoneString();

    const addPriceRecordList = model.price.map((v) => ({
      unit: v.unit,
      country: v.country,
      value: v.value,
    }));
    const addQuery = {
      text: singleLine`
          INSERT INTO public.external_product_price (id, external_store_id, price, unit, country, insert_date)
          SELECT public.uuid_generate_v4(),
                 $1,
                 t.value,
                 t.unit,
                 t.country,
                 $2
          FROM json_to_recordset($3) as t(value float, unit varchar(50), country varchar(50))
          ON CONFLICT (external_store_id, unit, country)
          WHERE delete_date ISNULL
              DO
          UPDATE
          SET unit        = EXCLUDED.unit,
              price       = EXCLUDED.price,
              country     = EXCLUDED.country,
              update_date = EXCLUDED.insert_date
          RETURNING *
      `,
      values: [model.id, now, JSON.stringify(addPriceRecordList)],
    };

    try {
      const { rows } = await this.#db.query(addQuery);

      const result = [];
      rows.map((v) => this._fillExternalProductPrice(result, v));

      model.price = result[0].price;

      return [null, model];
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

  async updateExternalStore(model) {
    if (typeof model.id === 'undefined' && typeof model.productId === 'undefined') {
      return [new ModelIdNotExistException()];
    }

    const columns = [];
    /**
     * @type {Array<*>}
     */
    const params = [model.id, model.productId];

    if (typeof model.type !== 'undefined') {
      params.push(model.type);
      columns.push(`type = $${params.length}`);
    }
    if (typeof model.serial !== 'undefined') {
      params.push(model.serial);
      columns.push(`serial = $${params.length}`);
    }

    if (columns.length === 0) {
      return [new DatabaseMinParamUpdateException()];
    }

    params.push(this.#dateTime.gregorianCurrentDateWithTimezoneString());
    columns.push(`update_date = $${params.length}`);

    const updateQuery = {
      text: singleLine`
          UPDATE public.external_store
          SET ${columns.join(', ')}
          WHERE delete_date ISNULL
            AND id = $1
            AND product_id = $2
      `,
      values: [...params],
    };

    try {
      await this.#db.query(updateQuery);

      return [null];
    } catch (error) {
      if (error.message.match(/duplicate key value .+ "external_store_serial"/)) {
        return [new AlreadyExistException('The record of external store already exist.')];
      }

      return [new DatabaseExecuteException(error)];
    }
  }

  async delete(id) {
    const [errorClient, client] = await this._getDatabaseClient();
    if (errorClient) {
      return [errorClient];
    }

    const now = this.#dateTime.gregorianCurrentDateWithTimezoneString();
    const deleteQuery = {
      text: singleLine`
          UPDATE public.product
          SET delete_date = $2
          WHERE delete_date ISNULL
            AND id = $1
      `,
      values: [id, now],
    };
    const deleteExternalStoreQuery = {
      text: singleLine`
          UPDATE public.external_store
          SET delete_date = $2
          WHERE delete_date ISNULL
            AND product_id = $1
      `,
      values: [id, now],
    };
    const deleteExternalProductPriceQuery = {
      text: singleLine`
          UPDATE public.external_product_price
          SET delete_date = $2
          WHERE delete_date ISNULL
            AND external_store_id in (SELECT id FROM public.external_store WHERE product_id = $1)
      `,
      values: [id, now],
    };

    const transaction = { isStart: false };
    try {
      await client.query(`BEGIN`);
      transaction.isStart = true;

      await Promise.all([
        client.query(deleteQuery),
        client.query(deleteExternalStoreQuery),
        client.query(deleteExternalProductPriceQuery),
      ]);

      await client.query('END');

      return [null];
    } catch (executeError) {
      return [await this._rollbackOnError(client, executeError, transaction.isStart)];
    } finally {
      client.release();
    }
  }

  async deleteExternalStore(productId, externalStoreId) {
    const [errorClient, client] = await this._getDatabaseClient();
    if (errorClient) {
      return [errorClient];
    }

    const now = this.#dateTime.gregorianCurrentDateWithTimezoneString();
    const deleteExternalStoreQuery = {
      text: singleLine`
          UPDATE public.external_store
          SET delete_date = $3
          WHERE delete_date ISNULL
            AND id = $1
            AND product_id = $2
      `,
      values: [externalStoreId, productId, now],
    };
    const deleteExternalProductPriceQuery = {
      text: singleLine`
          UPDATE public.external_product_price
          SET delete_date = $3
          WHERE delete_date ISNULL
            AND external_store_id in
                (SELECT id FROM public.external_store WHERE id = $1 AND product_id = $2)
      `,
      values: [externalStoreId, productId, now],
    };

    const transaction = { isStart: false };
    try {
      await client.query(`BEGIN`);
      transaction.isStart = true;

      await Promise.all([
        client.query(deleteExternalStoreQuery),
        client.query(deleteExternalProductPriceQuery),
      ]);

      await client.query('END');

      return [null];
    } catch (executeError) {
      return [await this._rollbackOnError(client, executeError, transaction.isStart)];
    } finally {
      client.release();
    }
  }

  /**
   *
   * @return {Promise<(Error|Object)[]>}
   * @private
   */
  async _getDatabaseClient() {
    try {
      const client = await this.#db.connect();

      return [null, client];
    } catch (error) {
      return [new DatabaseConnectionException(error)];
    }
  }

  /**
   *
   * @param client
   * @param queryError
   * @param hasTransactionStart
   * @return {Promise<DatabaseExecuteException|DatabaseRollbackException|AlreadyExistException>}
   * @private
   */
  async _rollbackOnError(client, queryError, hasTransactionStart) {
    if (!hasTransactionStart) {
      return new DatabaseExecuteException(queryError);
    }

    try {
      await client.query('ROLLBACK');

      if (queryError.message.match(/duplicate key value .+ "external_store_serial"/)) {
        return new AlreadyExistException('The record of external store already exist.');
      }

      return new DatabaseExecuteException(queryError);
    } catch (rollbackError) {
      return new DatabaseRollbackException(queryError, rollbackError);
    }
  }

  _fillModel(result, row) {
    const find = result.find((v) => v.id === row['id']);
    if (find) {
      this._fillExternalStoreModel(find, row);
      return;
    }

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

    this._fillExternalStoreModel(model, row);

    result.push(model);
  }

  _fillExternalStoreModel(productModel, row) {
    if (!row['external_store_id']) {
      return;
    }

    const externalStoreModel = new ExternalStoreModel();
    externalStoreModel.id = row['external_store_id'];
    externalStoreModel.productId = row['id'];
    externalStoreModel.type = row['external_store_type'];
    externalStoreModel.serial = row['external_store_serial'];
    externalStoreModel.price = (row['external_store_price'] || []).map((v) => ({
      unit: v.unit ? v.unit.toUpperCase() : '',
      country: v.country ? v.country.toUpperCase() : '',
      value: v.value,
    }));
    externalStoreModel.insertDate = this.#dateTime.gregorianDateWithTimezone(
      row['external_store_insert_date'],
    );

    productModel.externalStore.push(externalStoreModel);
  }

  _fillExternalProductPrice(result, row) {
    const unit = row['unit'] ? row['unit'].toUpperCase() : '';
    const country = row['country'] ? row['country'].toUpperCase() : '';

    const find = result.find((v) => v.id === row['external_store_id']);
    if (find) {
      find.price.push({ unit, country, value: row['price'] });
      return;
    }

    const model = new ExternalStoreModel();
    model.id = row['external_store_id'];
    model.price.push({ unit, country, value: row['price'] });

    result.push(model);
  }
}

module.exports = ProductPgRepository;
