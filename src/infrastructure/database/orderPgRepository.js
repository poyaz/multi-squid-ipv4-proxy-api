const { singleLine } = require('~src/utility');
const IOrderRepository = require('~src/core/interface/iOrderRepository');

const OrderModel = require('~src/core/model/orderModel');
const SubscriptionModel = require('~src/core/model/subscriptionModel');
const ModelIdNotExistException = require('~src/core/exception/modelIdNotExistException');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');
const DatabaseMinParamUpdateException = require('~src/core/exception/databaseMinParamUpdateException');

class OrderPgRepository extends IOrderRepository {
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

  async getById(orderId) {
    const getByIdQuery = {
      text: singleLine`
          SELECT o.id,
                 o.user_id,
                 u.username,
                 o.product_id,
                 o.package_id,
                 o.serial,
                 o.service_name,
                 o.status,
                 (SELECT status
                  FROM public.subscription s
                  WHERE o.id = s.order_id
                    AND s.delete_date ISNULL
                  ORDER BY s.insert_date DESC
                  limit 1) AS last_subscription_status,
                 o.package_count,
                 o.package_proxy_day,
                 o.package_proxy_type,
                 o.package_country_code,
                 o.insert_date,
                 o.update_date
          FROM public.orders o
                   INNER JOIN public.users u ON o.user_id = u.id
          WHERE o.delete_date ISNULL
            AND u.delete_date ISNULL
            AND o.id = $1
      `,
      values: [orderId],
    };

    try {
      const { rowCount, rows } = await this.#db.query(getByIdQuery);
      if (rowCount === 0) {
        return [null, null];
      }

      const result = this._fillModel(rows[0]);

      return [null, result];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  async getAll(filterModel) {
    const filterConditions = [];
    const getAllQuery = {
      text: singleLine`
          SELECT o.id,
                 o.user_id,
                 u.username,
                 o.product_id,
                 o.package_id,
                 o.serial,
                 o.service_name,
                 o.status,
                 (SELECT status
                  FROM public.subscription s
                  WHERE o.id = s.order_id
                    AND s.delete_date ISNULL
                  ORDER BY s.insert_date DESC
                  limit 1) AS last_subscription_status,
                 o.package_count,
                 o.package_proxy_day,
                 o.package_proxy_type,
                 o.package_country_code,
                 o.insert_date,
                 o.update_date
          FROM public.orders o
                   INNER JOIN public.users u ON o.user_id = u.id
          WHERE o.delete_date ISNULL
            AND u.delete_date ISNULL
      `,
      values: [],
    };

    if (typeof filterModel.orderSerial !== 'undefined') {
      getAllQuery.values.push(filterModel.orderSerial);
      filterConditions.push(`serial = $${getAllQuery.values.length}`);
    }
    if (typeof filterModel.packageId !== 'undefined') {
      getAllQuery.values.push(filterModel.packageId);
      filterConditions.push(`package_id = $${getAllQuery.values.length}`);
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

  async getSubscriptionById(subscriptionId) {
    const getByIdQuery = {
      text: singleLine`
          SELECT s.*
          FROM public.subscription s
          WHERE s.delete_date ISNULL
            AND s.id = $1
      `,
      values: [subscriptionId],
    };

    try {
      const { rowCount, rows } = await this.#db.query(getByIdQuery);
      if (rowCount === 0) {
        return [null, null];
      }

      const result = this._fillSubscriptionModel(rows[0]);

      return [null, result];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  async getAllSubscriptionByOrderId(orderId) {
    const getByIdQuery = {
      text: singleLine`
          SELECT s.*
          FROM public.subscription s
          WHERE s.delete_date ISNULL
            AND s.order_id = $1
      `,
      values: [orderId],
    };

    try {
      const { rowCount, rows } = await this.#db.query(getByIdQuery);
      if (rowCount === 0) {
        return [null, []];
      }

      const result = rows.map((v) => this._fillSubscriptionModel(v));

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
          INSERT INTO public.orders (id, user_id, product_id, package_id, serial, service_name,
                                     status, body, package_count, package_proxy_day,
                                     package_proxy_type,
                                     package_country_code, insert_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *, (SELECT username FROM public.users u WHERE u.id = user_id) AS username
      `,
      values: [
        id,
        model.userId,
        model.productId,
        model.packageId,
        model.orderSerial,
        model.serviceName,
        model.status,
        model.orderBodyData,
        model.prePackageOrderInfo.count,
        model.prePackageOrderInfo.expireDay,
        model.prePackageOrderInfo.proxyType,
        model.prePackageOrderInfo.countryCode.toUpperCase(),
        now,
      ],
    };

    try {
      const { rows } = await this.#db.query(addQuery);

      const result = this._fillModel(rows[0]);

      return [null, result];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  async addSubscription(model) {
    const id = this.#identifierGenerator.generateId();
    const now = this.#dateTime.gregorianCurrentDateWithTimezoneString();

    const addQuery = {
      text: singleLine`
          INSERT INTO public.subscription (id, order_id, serial, status, body, insert_date)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
      `,
      values: [id, model.orderId, model.serial, model.status, model.subscriptionBodyData, now],
    };

    try {
      const { rows } = await this.#db.query(addQuery);

      const result = this._fillSubscriptionModel(rows[0]);

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

    if (typeof model.packageId !== 'undefined') {
      params.push(model.packageId);
      columns.push(`package_id = $${params.length}`);
    }
    if (typeof model.orderSerial !== 'undefined') {
      params.push(model.orderSerial);
      columns.push(`serial = $${params.length}`);
    }
    if (typeof model.status !== 'undefined') {
      params.push(model.status);
      columns.push(`status = $${params.length}`);
    }
    if (typeof model.orderBodyData !== 'undefined') {
      params.push(model.orderBodyData);
      columns.push(`body = $${params.length}`);
    }

    if (columns.length === 0) {
      return [new DatabaseMinParamUpdateException()];
    }

    params.push(this.#dateTime.gregorianCurrentDateWithTimezoneString());
    columns.push(`update_date = $${params.length}`);

    const updateQuery = {
      text: singleLine`
          UPDATE public.orders
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
    const model = new OrderModel();
    model.id = row['id'];
    model.userId = row['user_id'];
    model.productId = row['product_id'];
    model.packageId = row['package_id'];
    model.username = row['username'];
    model.orderSerial = row['serial'];
    model.serviceName = row['service_name'];
    model.status = row['status'];
    model.lastSubscriptionStatus = row['last_subscription_status'];
    model.prePackageOrderInfo = {
      count: row['package_count'],
      expireDay: row['package_proxy_day'],
      proxyType: row['package_proxy_type'],
      countryCode: row['package_country_code'],
    };
    model.insertDate = this.#dateTime.gregorianDateWithTimezone(row['insert_date']);
    model.updateDate = row['update_date']
      ? this.#dateTime.gregorianDateWithTimezone(row['update_date'])
      : null;

    return model;
  }

  _fillSubscriptionModel(row) {
    const model = new SubscriptionModel();
    model.id = row['id'];
    model.orderId = row['order_id'];
    model.status = row['status'];
    model.insertDate = this.#dateTime.gregorianDateWithTimezone(row['insert_date']);
    model.updateDate = row['update_date']
      ? this.#dateTime.gregorianDateWithTimezone(row['update_date'])
      : null;

    return model;
  }
}

module.exports = OrderPgRepository;
