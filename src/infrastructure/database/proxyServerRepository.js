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

  _fillModel(row) {
    const model = new IpAddressModel();
    model.id = row['id'];
    model.interface = row['interface'];
    model.ip = row['ip'];
    model.port = row['port'];
    model.gateway = row['gateway'];

    return model;
  }
}

module.exports = ProxyServerRepository;
