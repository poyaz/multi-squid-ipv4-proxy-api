const { singleLine } = require('~src/utility');
const IOrderRepository = require('~src/core/interface/iOrderRepository');

const OrderModel = require('~src/core/model/orderModel');
const SubscriptionModel = require('~src/core/model/subscriptionModel');
const AlreadyExistException = require('~src/core/exception/alreadyExistException');
const ModelIdNotExistException = require('~src/core/exception/modelIdNotExistException');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');
const DatabaseRollbackException = require('~src/core/exception/databaseRollbackException');
const DatabaseConnectionException = require('~src/core/exception/databaseConnectionException');
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
