/**
 * Created by pooya on 8/26/21.
 */

const { singleLine } = require('~src/utility');
const PackageModel = require('~src/core/model/packageModel');
const IPackageRepository = require('~src/core/interface/iPackageRepository');
const ModelIdNotExistException = require('~src/core/exception/modelIdNotExistException');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');
const DatabaseRollbackException = require('~src/core/exception/databaseRollbackException');
const DatabaseConnectionException = require('~src/core/exception/databaseConnectionException');
const DatabaseMinParamUpdateException = require('~src/core/exception/databaseMinParamUpdateException');

class PackagePgRepository extends IPackageRepository {
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

  async getById(id) {
    const fetchQuery = {
      text: singleLine`
          SELECT DISTINCT ON (p.id) p.id,
                                    u.id                                                        AS user_id,
                                    u.username,
                                    p.expire_date,
                                    p.insert_date,
                                    count(*)                                                    AS count_ip,
                                    jsonb_agg(jsonb_build_object('ip', ba.ip, 'port', ba.port)) AS ip_list
          FROM public.users u,
               public.packages p,
               public.map_bind_address_package mbdp,
               public.bind_address ba
          WHERE u.id = p.user_id
            AND p.id = mbdp.package_id
            AND mbdp.bind_address_id = ba.id
            AND u.is_enable = true
            AND ba.is_enable = true
            AND u.delete_date ISNULL
            AND p.delete_date ISNULL
            AND mbdp.delete_date ISNULL
            AND ba.delete_date ISNULL
            AND p.id = $1
          GROUP BY p.id, u.id, u.username, p.expire_date, p.insert_date
      `,
      values: [id],
    };

    try {
      const { rowCount, rows } = await this.#db.query(fetchQuery);
      if (rowCount === 0) {
        return [null, null];
      }

      const result = this._fillModel(rows[0]);

      return [null, result];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  async getAllByUsername(username) {
    const fetchQuery = {
      text: singleLine`
          SELECT DISTINCT ON (p.id, p.insert_date) p.id,
                                                   u.id                                                        AS user_id,
                                                   u.username,
                                                   p.expire_date,
                                                   p.insert_date,
                                                   count(*)                                                    AS count_ip,
                                                   jsonb_agg(jsonb_build_object('ip', ba.ip, 'port', ba.port)) AS ip_list
          FROM public.users u,
               public.packages p,
               public.map_bind_address_package mbdp,
               public.bind_address ba
          WHERE u.id = p.user_id
            AND p.id = mbdp.package_id
            AND mbdp.bind_address_id = ba.id
            AND u.is_enable = true
            AND ba.is_enable = true
            AND u.delete_date ISNULL
            AND p.delete_date ISNULL
            AND mbdp.delete_date ISNULL
            AND ba.delete_date ISNULL
            AND u.username = $1
          GROUP BY p.id, u.id, u.username, p.expire_date, p.insert_date
          ORDER BY p.insert_date DESC
      `,
      values: [username],
    };

    try {
      const { rowCount, rows } = await this.#db.query(fetchQuery);
      if (rowCount === 0) {
        return [null, []];
      }

      const result = rows.map((v) => this._fillModel(v));

      return [null, result];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  async add(model) {
    const [errorClient, client] = await this._getDatabaseClient();
    if (errorClient) {
      return [errorClient];
    }

    const now = this.#dateTime.gregorianCurrentDateWithTimezoneString();
    const packageId = this.#identifierGenerator.generateId();
    const expireDate = this.#dateTime.gregorianWithTimezoneString(model.expireDate);

    const insertToPackage = {
      text: singleLine`
          INSERT INTO public.packages (id, user_id, expire_date, insert_date)
          VALUES ($1, $2, $3, $4)
          RETURNING *
      `,
      values: [packageId, model.userId, expireDate, now],
    };
    const insertToMap = {
      text: singleLine`
          WITH unique_bind_address AS (
              SELECT ba.id, ba.ip, ba.port
              FROM public.bind_address ba
              WHERE delete_date ISNULL
                AND ba.is_enable = true
                  EXCEPT
              SELECT DISTINCT ba.id, ba.ip, ba.port
              FROM public.users u,
                   public.packages p,
                   public.map_bind_address_package mbdp,
                   public.bind_address ba
              WHERE u.id = p.user_id
                AND p.id = mbdp.package_id
                AND mbdp.bind_address_id = ba.id
                AND u.is_enable = true
                AND ba.is_enable = true
                AND u.delete_date ISNULL
                AND p.delete_date ISNULL
                AND mbdp.delete_date ISNULL
                AND ba.delete_date ISNULL
                AND u.id = $1
                AND p.expire_date < $2)
          INSERT
          INTO public.map_bind_address_package (id, bind_address_id, package_id)
          SELECT public.uuid_generate_v4(), id, $3
          FROM unique_bind_address
          ORDER BY random()
          LIMIT $4
          RETURNING (SELECT ip FROM public.bind_address ba WHERE ba.id = bind_address_id), (SELECT port FROM public.bind_address ba WHERE ba.id = bind_address_id)
      `,
      values: [model.userId, expireDate, packageId, model.countIp],
    };

    const transaction = { isStart: false };
    try {
      await client.query(`BEGIN`);
      transaction.isStart = true;

      const { rows: packageRows } = await client.query(insertToPackage);

      const { rowCount, rows: ipRows } = await client.query(insertToMap);

      await client.query('END');

      packageRows[0]['username'] = model.username;
      packageRows[0]['count_ip'] = rowCount;

      const result = this._fillModel(packageRows[0]);

      result.ipList = ipRows.map((v) => ({ ip: v['ip'], port: v['port'] }));

      return [null, result];
    } catch (executeError) {
      return [await this._rollbackOnError(client, executeError, transaction.isStart)];
    } finally {
      client.release();
    }
  }

  async update(model) {
    if (typeof model.id === 'undefined') {
      return [new ModelIdNotExistException()];
    }

    const columns = [];
    const param = [model.id];

    if (typeof model.expireDate !== 'undefined') {
      param.push(this.#dateTime.gregorianWithTimezoneString(model.expireDate));
      columns.push(`expire_date = $${param.length}`);
    }

    if (columns.length === 0) {
      return [new DatabaseMinParamUpdateException()];
    }

    param.push(this.#dateTime.gregorianCurrentDateWithTimezoneString());
    columns.push(`update_date = $${param.length}`);

    const updateQuery = {
      text: singleLine`
          UPDATE public.packages
          SET ${columns.join(', ')}
          WHERE delete_date ISNULL
            AND id = $1
      `,
      values: [...param],
    };

    try {
      const { rowCount } = await this.#db.query(updateQuery);

      return [null, rowCount];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
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
   * @return {Promise<DatabaseExecuteException|DatabaseRollbackException>}
   * @private
   */
  async _rollbackOnError(client, queryError, hasTransactionStart) {
    if (!hasTransactionStart) {
      return new DatabaseExecuteException(queryError);
    }

    try {
      await client.query('ROLLBACK');

      return new DatabaseExecuteException(queryError);
    } catch (rollbackError) {
      return new DatabaseRollbackException(queryError, rollbackError);
    }
  }

  _fillModel(row) {
    const model = new PackageModel();
    model.id = row['id'];
    model.userId = row['user_id'];
    model.username = row['username'];
    model.countIp = row['count_ip'];
    model.ipList = row['ip_list'];
    model.expireDate = row['expire_date'];
    model.insertDate = row['insert_date'];

    return model;
  }
}

module.exports = PackagePgRepository;
