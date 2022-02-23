/**
 * Created by pooya on 2/13/22.
 */

const { singleLine } = require('~src/utility');
const IServerRepository = require('~src/core/interface/iServerRepository');
const ServerModel = require('~src/core/model/serverModel');
const ModelIdNotExistException = require('~src/core/exception/modelIdNotExistException');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');
const DatabaseMinParamUpdateException = require('~src/core/exception/databaseMinParamUpdateException');

class ServerRepository extends IServerRepository {
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
          SELECT id,
                 name,
                 ip_range,
                 host_ip_address,
                 host_api_port,
                 is_enable,
                 insert_date
          FROM public.servers
          WHERE id = $1
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

  async getByIpAddress(ip) {
    const fetchQuery = {
      text: singleLine`
          SELECT id,
                 name,
                 ip_range,
                 host_ip_address,
                 host_api_port,
                 is_enable,
                 insert_date
          FROM public.servers
          WHERE is_enable = true
            AND host($1::inet) << any (ip_range)
      `,
      values: [ip],
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

  async getAll() {
    const fetchQuery = {
      text: singleLine`
          SELECT id,
                 name,
                 ip_range,
                 host_ip_address,
                 host_api_port,
                 is_enable,
                 insert_date
          FROM public.servers
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

  async add(model) {
    const id = this.#identifierGenerator.generateId();
    const now = this.#dateTime.gregorianCurrentDateWithTimezoneString();

    const addQuery = {
      text: singleLine`
          INSERT INTO public.servers (id, name, ip_range, host_ip_address, host_api_port, is_enable,
                                      insert_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
      `,
      values: [id, model.name, model.ipRange, model.hostIpAddress, model.hostApiPort, true, now],
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

    if (typeof model.name !== 'undefined') {
      params.push(model.name);
      columns.push(`name = $${params.length}`);
    }
    if (typeof model.ipRange !== 'undefined') {
      params.push(model.ipRange);
      columns.push(`ip_range = $${params.length}`);
    }
    if (typeof model.hostIpAddress !== 'undefined') {
      params.push(model.hostIpAddress);
      columns.push(`host_ip_address = $${params.length}`);
    }
    if (typeof model.hostApiPort !== 'undefined') {
      params.push(model.hostApiPort);
      columns.push(`host_api_port = $${params.length}`);
    }
    if (typeof model.isEnable !== 'undefined') {
      params.push(model.isEnable);
      columns.push(`is_enable = $${params.length}`);
    }

    if (columns.length === 0) {
      return [new DatabaseMinParamUpdateException()];
    }

    params.push(this.#dateTime.gregorianCurrentDateWithTimezoneString());

    const updateQuery = {
      text: singleLine`
          UPDATE public.servers
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

  async delete(id) {
    const fetchQuery = {
      text: singleLine`
          DELETE
          FROM public.servers
          WHERE id = $1
      `,
      values: [id],
    };

    try {
      await this.#db.query(fetchQuery);

      return [null];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  _fillModel(row) {
    const model = new ServerModel();
    model.id = row['id'];
    model.name = row['name'];
    model.ipRange = row['ip_range'];
    model.hostIpAddress = row['host_ip_address'];
    model.hostApiPort = row['host_api_port'];
    model.isEnable = row['is_enable'];
    model.insertDate = this.#dateTime.gregorianDateWithTimezone(row['insert_date']);

    return model;
  }
}

module.exports = ServerRepository;
