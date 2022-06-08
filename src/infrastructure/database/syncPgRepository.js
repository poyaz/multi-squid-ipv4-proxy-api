/**
 * Created by pooya on 5/29/22.
 */

const { singleLine } = require('~src/utility');
const ISyncRepository = require('~src/core/interface/iSyncRepository');
const SyncModel = require('~src/core/model/syncModel');
const SubscriptionModel = require('~src/core/model/subscriptionModel');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');
const ModelIdNotExistException = require('~src/core/exception/modelIdNotExistException');
const DatabaseMinParamUpdateException = require('~src/core/exception/databaseMinParamUpdateException');

class SyncPgRepository extends ISyncRepository {
  #db;
  /**
   * @type {IDateTime}
   */
  #dateTime;
  /**
   * @type {IIdentifierGenerator}
   */
  #identifierGenerator;
  #maxErrorFail = 3;

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

  async getListOfPackageNotSynced() {
    const getAllNotSyncedQuery = {
      text: singleLine`
          SELECT p.id                                AS references_id,
                 coalesce(s.service_name, $1)        AS service_name,
                 CASE
                     WHEN count(*) FILTER ( WHERE s.status = 'error' ) > $2 THEN 'fail'
                     ELSE s.status END               AS status,
                 max(coalesce(s.insert_date, 'now')) AS insert_date
          FROM packages p
                   LEFT JOIN sync s
                             ON p.id = s.references_id AND s.service_name = $1
          WHERE s.status ISNULL
             OR (s.id NOTNULL AND s.status NOT IN ('success', 'in_process'))
          GROUP BY p.id, s.service_name, s.status
          HAVING count(*) FILTER ( WHERE s.status = 'error' ) <= $2
      `,
      values: [SyncModel.SERVICE_SYNC_PACKAGE, this.#maxErrorFail],
    };

    return this._executeQuery(getAllNotSyncedQuery);
  }

  async getListOfOrderNotCanceled() {
    const getAllNotCanceledQuery = {
      text: singleLine`
          SELECT (SELECT o.package_id FROM orders o WHERE o.id = sub.order_id) AS references_id,
                 coalesce(s.service_name, $1)                                  AS service_name,
                 CASE
                     WHEN count(*) FILTER ( WHERE s.status = 'error' ) > $2 THEN 'fail'
                     ELSE s.status END                                         AS status,
                 max(coalesce(s.insert_date, 'now'))                           AS insert_date
          FROM subscription sub
                   LEFT JOIN sync s
                             ON sub.order_id = s.references_id AND s.service_name = $1
          WHERE (s.status ISNULL
              OR (s.id NOTNULL AND s.status NOT IN ('success', 'in_process')))
            AND sub.status = $3
          GROUP BY sub.id, s.service_name, s.status
          HAVING count(*) FILTER ( WHERE s.status = 'error' ) <= $2
      `,
      values: [
        SyncModel.SERVICE_CANCEL_SUBSCRIPTION,
        this.#maxErrorFail,
        SubscriptionModel.STATUS_CANCELED,
      ],
    };

    return this._executeQuery(getAllNotCanceledQuery);
  }

  async getListOfPackageNotExpired() {
    const now = this.#dateTime.gregorianCurrentDateWithTimezoneString();

    const getAllNotSyncedQuery = {
      text: singleLine`
          SELECT p.id                                AS references_id,
                 coalesce(s.service_name, $1)        AS service_name,
                 CASE
                     WHEN count(*) FILTER ( WHERE s.status = 'error' ) > $2 THEN 'fail'
                     ELSE s.status END               AS status,
                 max(coalesce(s.insert_date, 'now')) AS insert_date
          FROM packages p
                   LEFT JOIN sync s
                             ON p.id = s.references_id AND s.service_name = $1
          WHERE (s.status ISNULL
              OR (s.id NOTNULL AND s.status NOT IN ('success', 'in_process')))
            AND p.expire_date < $3
          GROUP BY p.id, s.service_name, s.status
          HAVING count(*) FILTER ( WHERE s.status = 'error' ) <= $2
      `,
      values: [SyncModel.SERVICE_EXPIRE_PACKAGE, this.#maxErrorFail, now],
    };

    return this._executeQuery(getAllNotSyncedQuery);
  }

  async getListOfInProcessExpired(expireDate) {
    const date = this.#dateTime.gregorianWithTimezoneString(expireDate);

    const getAllProcessHasBeenExpired = {
      text: singleLine`
          SELECT *
          FROM sync
          WHERE status = $1
            AND insert_date < $2
      `,
      values: [SyncModel.STATUS_PROCESS, date],
    };

    return this._executeQuery(getAllProcessHasBeenExpired);
  }

  async add(model) {
    const id = this.#identifierGenerator.generateId();
    const now = this.#dateTime.gregorianCurrentDateWithTimezoneString();

    const addQuery = {
      text: singleLine`
          INSERT INTO public.sync (id, references_id, service_name, status, insert_date)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
      `,
      values: [id, model.referencesId, model.serviceName, model.status, now],
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

    if (typeof model.referencesId !== 'undefined') {
      params.push(model.referencesId);
      columns.push(`references_id = $${params.length}`);
    }
    if (typeof model.serviceName !== 'undefined') {
      params.push(model.serviceName);
      columns.push(`service_name = $${params.length}`);
    }
    if (typeof model.status !== 'undefined') {
      params.push(model.status);
      columns.push(`status = $${params.length}`);
    }

    if (columns.length === 0) {
      return [new DatabaseMinParamUpdateException()];
    }

    params.push(this.#dateTime.gregorianCurrentDateWithTimezoneString());
    columns.push(`update_date = $${params.length}`);

    const updateQuery = {
      text: singleLine`
          UPDATE public.sync
          SET ${columns.join(', ')}
          WHERE id = $1
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

  async getListOfUserNotSynced() {
    const getAllNotSyncedQuery = {
      text: singleLine`
          SELECT u.id                                AS references_id,
                 coalesce(s.service_name, $1)        AS service_name,
                 CASE
                     WHEN count(*) FILTER ( WHERE s.status = 'error' ) > $2 THEN 'fail'
                     WHEN count(*) FILTER ( WHERE s.status = 'success' ) > 0 AND
                          u.update_date > max(s.update_date) THEN NULL
                     ELSE s.status END               AS status,
                 max(coalesce(s.insert_date, 'now')) AS insert_date
          FROM users u
                   LEFT JOIN sync s
                             ON u.id = s.references_id AND s.service_name = $1
          WHERE s.status ISNULL
             OR (s.id NOTNULL AND
                 (s.status NOT IN ('success', 'in_process') OR u.update_date >= s.insert_date))
          GROUP BY u.id, s.service_name, s.status
          HAVING count(*) FILTER ( WHERE s.status = 'error' ) <= $2
      `,
      values: [SyncModel.SERVICE_SYNC_USER, this.#maxErrorFail],
    };

    return this._executeQuery(getAllNotSyncedQuery);
  }

  async _executeQuery(query) {
    try {
      const { rowCount, rows } = await this.#db.query(query);
      if (rowCount === 0) {
        return [null, []];
      }

      const result = rows.map((v) => this._fillModel(v));

      return [null, result];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  _fillModel(row) {
    const model = new SyncModel();
    model.id = row['id'];
    model.referencesId = row['references_id'];
    model.serviceName = row['service_name'];
    model.status = row['status'];
    model.insertDate = row['insert_date']
      ? this.#dateTime.gregorianDateWithTimezone(row['insert_date'])
      : null;
    model.updateDate = row['update_date']
      ? this.#dateTime.gregorianDateWithTimezone(row['update_date'])
      : null;

    return model;
  }
}

module.exports = SyncPgRepository;
