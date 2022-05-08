/**
 * Created by pooya on 8/26/21.
 */

const { singleLine } = require('~src/utility');
const PackageModel = require('~src/core/model/packageModel');
const IPackageRepository = require('~src/core/interface/iPackageRepository');
const NoUniqueIpException = require('~src/core/exception/noUniqueIpException');
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
                                    u.password,
                                    p.status,
                                    p.expire_date,
                                    p.insert_date,
                                    p.renewal_date,
                                    count(*)                                                    AS count_ip,
                                    (array_agg(DISTINCT ba.proxy_type))[1]                      AS proxy_type,
                                    (array_agg(DISTINCT ba.country_code))[1]                    AS country_code,
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
          GROUP BY p.id, u.id, u.username, p.status, p.expire_date, p.insert_date, p.renewal_date
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

  async getAllByUsername(username, filterModel) {
    const filterConditions = [];
    const fetchQuery = {
      text: singleLine`
          SELECT DISTINCT ON (p.id, p.insert_date) p.id,
                                                   u.id                                                        AS user_id,
                                                   u.username,
                                                   u.password,
                                                   p.status,
                                                   p.expire_date,
                                                   p.insert_date,
                                                   p.renewal_date,
                                                   count(*)                                                    AS count_ip,
                                                   (array_agg(DISTINCT ba.proxy_type))[1]                      AS proxy_type,
                                                   (array_agg(DISTINCT ba.country_code))[1]                    AS country_code,
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
      `,
      values: [username],
    };

    if (typeof filterModel.type !== 'undefined') {
      fetchQuery.values.push(filterModel.type);
      filterConditions.push(`ba.proxy_type = $${fetchQuery.values.length}`);
    }
    if (typeof filterModel.country !== 'undefined') {
      fetchQuery.values.push(filterModel.country.toUpperCase());
      filterConditions.push(`ba.country_code = $${fetchQuery.values.length}`);
    }
    if (typeof filterModel.status !== 'undefined') {
      fetchQuery.values.push(filterModel.status);
      filterConditions.push(`p.status = $${fetchQuery.values.length}`);
    }

    if (filterConditions.length > 0) {
      fetchQuery.text += ` AND ${filterConditions.join(' AND ')}`;
    }

    fetchQuery.text += ` GROUP BY p.id, u.id, u.username, p.status, p.expire_date, p.insert_date, p.renewal_date`;
    fetchQuery.text += ` ORDER BY p.insert_date DESC`;

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

  async getAllExpirePackage() {
    const now = this.#dateTime.gregorianCurrentDateWithTimezoneString();

    const expireQuery = {
      text: singleLine`
          SELECT DISTINCT ON (p.id, p.insert_date) p.id,
                                                   u.id                                                        AS user_id,
                                                   u.username,
                                                   p.status,
                                                   p.expire_date,
                                                   p.insert_date,
                                                   p.renewal_date,
                                                   count(*)                                                    AS count_ip,
                                                   (array_agg(DISTINCT ba.proxy_type))[1]                      AS proxy_type,
                                                   (array_agg(DISTINCT ba.country_code))[1]                    AS country_code,
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
            AND p.status <> $1
            AND p.expire_date < $2
          GROUP BY p.id, u.id, u.username, p.status, p.expire_date, p.insert_date, p.renewal_date
          ORDER BY p.insert_date DESC
      `,
      values: [PackageModel.STATUS_EXPIRE, now],
    };

    try {
      const { rowCount, rows } = await this.#db.query(expireQuery);
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
    const expireDate = model.expireDate
      ? this.#dateTime.gregorianWithTimezoneString(model.expireDate)
      : null;
    const renewalDate = model.renewalDate
      ? this.#dateTime.gregorianWithTimezoneString(model.renewalDate)
      : null;
    const proxyType = model.type ? model.type : '-';
    const countryCode = model.country ? model.country.toUpperCase() : '-';

    const insertToPackage = {
      text: singleLine`
          INSERT INTO public.packages (id, user_id, status, expire_date, renewal_date, insert_date)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
      `,
      values: [packageId, model.userId, model.status, expireDate, renewalDate, now],
    };
    const insertToMap = {
      text: singleLine`
          WITH unique_bind_address AS (
              SELECT ba.id, ba.ip, ba.port
              FROM public.bind_address ba
              WHERE delete_date ISNULL
                AND ba.is_enable = true
                AND ba.proxy_type = $5
                AND ba.country_code = $6
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
                AND p.expire_date < $2
                AND ba.proxy_type = $5
                AND ba.country_code = $6)
          INSERT
          INTO public.map_bind_address_package (id, bind_address_id, package_id)
          SELECT public.uuid_generate_v4(), id, $3
          FROM unique_bind_address
          ORDER BY random()
          LIMIT $4
          RETURNING (SELECT ip FROM public.bind_address ba WHERE ba.id = bind_address_id), (SELECT port FROM public.bind_address ba WHERE ba.id = bind_address_id)
      `,
      values: [model.userId, expireDate, packageId, model.countIp, proxyType, countryCode],
    };

    const transaction = { isStart: false };
    try {
      await client.query(`BEGIN`);
      transaction.isStart = true;

      const { rows: packageRows } = await client.query(insertToPackage);

      const { rowCount, rows: ipRows } = await client.query(insertToMap);

      if (rowCount === 0) {
        await client.query('ROLLBACK');

        return [new NoUniqueIpException()];
      }

      await client.query('END');

      packageRows[0]['username'] = model.username;
      packageRows[0]['count_ip'] = rowCount;
      packageRows[0]['proxy_type'] = proxyType;
      packageRows[0]['country_code'] = countryCode;

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

    if (typeof model.status !== 'undefined') {
      param.push(model.status);
      columns.push(`status = $${param.length}`);
    }
    if (typeof model.expireDate !== 'undefined') {
      param.push(
        model.expireDate ? this.#dateTime.gregorianWithTimezoneString(model.expireDate) : null,
      );
      columns.push(`expire_date = $${param.length}`);
    }
    if (typeof model.renewalDate !== 'undefined') {
      param.push(
        model.renewalDate !== null
          ? this.#dateTime.gregorianWithTimezoneString(model.renewalDate)
          : null,
      );
      columns.push(`renewal_date = $${param.length}`);
    }
    if (typeof model.deleteDate !== 'undefined') {
      param.push(this.#dateTime.gregorianWithTimezoneString(model.deleteDate));
      columns.push(`delete_date = $${param.length}`);
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
    model.password = row['password'];
    model.countIp = row['count_ip'];
    model.type = row['proxy_type'];
    model.country = row['country_code'] ? row['country_code'].toUpperCase() : row['country_code'];
    model.ipList = row['ip_list'];
    model.status = row['status'];
    model.expireDate = row['expire_date']
      ? this.#dateTime.gregorianDateWithTimezone(row['expire_date'])
      : null;
    model.insertDate = this.#dateTime.gregorianDateWithTimezone(row['insert_date']);
    model.renewalDate = row['renewal_date']
      ? this.#dateTime.gregorianDateWithTimezone(row['renewal_date'])
      : null;

    return model;
  }
}

module.exports = PackagePgRepository;
