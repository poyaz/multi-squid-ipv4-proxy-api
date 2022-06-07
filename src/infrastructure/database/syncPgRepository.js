/**
 * Created by pooya on 5/29/22.
 */

const { singleLine } = require('~src/utility');
const ISyncRepository = require('~src/core/interface/iSyncRepository');
const SyncModel = require('~src/core/model/syncModel');
const SubscriptionModel = require('~src/core/model/subscriptionModel');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');

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
          SELECT p.id                         AS references_id,
                 coalesce(s.service_name, $1) AS service_name,
                 CASE
                     WHEN count(*) FILTER ( WHERE s.status = 'error' ) > $2 THEN 'fail'
                     ELSE s.status END        AS status
          FROM packages p
                   LEFT JOIN sync s
                             ON p.id = s.references_id AND s.service_name = $1 AND
                                s.status NOT IN ('success', 'in_process')
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
          SELECT sub.order_id                 AS references_id,
                 coalesce(s.service_name, $1) AS service_name,
                 CASE
                     WHEN count(*) FILTER ( WHERE s.status = 'error' ) > $2 THEN 'fail'
                     ELSE s.status END        AS status
          FROM subscription sub
                   LEFT JOIN sync s
                             ON sub.order_id = s.references_id AND s.service_name = $1
                                 AND sub.status = $3 AND s.status NOT IN ('success', 'in_process')
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
          SELECT p.id                         AS references_id,
                 coalesce(s.service_name, $1) AS service_name,
                 CASE
                     WHEN count(*) FILTER ( WHERE s.status = 'error' ) > $2 THEN 'fail'
                     ELSE s.status END        AS status
          FROM packages p
                   LEFT JOIN sync s
                             ON p.id = s.references_id AND s.service_name = $1
                                 AND p.expire_date < $3
                                 AND s.status NOT IN ('success', 'in_process')
          GROUP BY p.id, s.service_name, s.status
          HAVING count(*) FILTER ( WHERE s.status = 'error' ) <= $2
      `,
      values: [SyncModel.SERVICE_EXPIRE_PACKAGE, this.#maxErrorFail, now],
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
