/**
 * Created by pooya on 8/30/21.
 */

const { singleLine } = require('~src/utility');
const IpAddressModel = require('~src/core/model/ipAddressModel');
const IProxyServerRepository = require('~src/core/interface/iProxyServerRepository');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');

class ProxyServerRepository extends IProxyServerRepository {
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

  async getByIpMask(ipWithMask) {
    const fetchQuery = {
      text: singleLine`
          SELECT id,
                 interface,
                 ip,
                 port,
                 gateway
          FROM public.bind_address
          WHERE delete_date ISNULL
            AND is_enable = false
            AND ip ::inet << inet $1
      `,
      values: [ipWithMask],
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

  async getAll() {
    const fetchQuery = {
      text: singleLine`
          SELECT id,
                 interface,
                 ip,
                 port,
                 gateway
          FROM public.bind_address
          WHERE delete_date ISNULL
            AND is_enable = true
      `,
      values: [],
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

  async add(models) {
    const now = this.#dateTime.gregorianCurrentDateWithTimezoneString();

    const insertRecordList = models.map((v) => ({
      interface: v.interface,
      ip: v.ip,
      port: v.port,
      gateway: v.gateway,
    }));

    const addQuery = {
      text: singleLine`
          INSERT INTO public.bind_address (id, interface, ip, port, gateway, insert_date)
          SELECT public.uuid_generate_v4(), interface, ip, port, gateway, $1
          FROM json_to_recordset($2) as (interface varchar(100), ip varchar(100), port int,
                                         gateway varchar(100))
          ON CONFLICT (ip)
          WHERE delete_date ISNULL
              DO
          UPDATE
          SET update_date = EXCLUDED.insert_date
      `,
      values: [now, JSON.stringify(insertRecordList)],
    };

    try {
      const { rowCount, rows } = await this.#db.query(addQuery);
      if (rowCount === 0) {
        return [null, []];
      }

      const result = rows.map((v) => this._fillModel(v));

      return [null, result];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  async activeIpMask(ipWithMask) {
    const updateQuery = {
      text: singleLine`
          UPDATE public.bind_address
          SET is_enable = true
          WHERE delete_date ISNULL
            AND is_enable = false
            AND ip ::inet << inet $1
      `,
      values: [ipWithMask],
    };

    try {
      await this.#db.query(updateQuery);

      return [null];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  _fillModel(row) {
    const model = new IpAddressModel();
    model.id = row['id'];
    model.interface = row['interface'];
    model.ip = row['ip'];
    model.mask = 32;
    model.port = row['port'];
    model.gateway = row['gateway'];

    return model;
  }
}

module.exports = ProxyServerRepository;
