/**
 * Created by pooya on 8/23/21.
 */

const { singleLine } = require('~src/utility');
const IUserRepository = require('~src/core/interface/iUserRepository');

const UserModel = require('~src/core/model/userModel');
const ModelIdNotExistException = require('~src/core/exception/modelIdNotExistException');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');
const DatabaseMinParamUpdateException = require('~src/core/exception/databaseMinParamUpdateException');

class UserPgRepository extends IUserRepository {
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
          SELECT *
          FROM public.users
          WHERE delete_date ISNULL
      `,
      values: [],
    };

    if (typeof filterModel.username !== 'undefined') {
      getAllQuery.values.push(filterModel.username);
      filterConditions.push(`username = $${getAllQuery.values.length}`);
    }
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

      const result = rows.map((v) => this._fillModel(v));

      return [null, result];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  async getUserById(userId) {
    const getAllQuery = {
      text: singleLine`
          SELECT *
          FROM public.users
          WHERE delete_date ISNULL
            AND id = $1
      `,
      values: [userId],
    };

    try {
      const { rowCount, rows } = await this.#db.query(getAllQuery);
      if (rowCount === 0) {
        return [null, null];
      }

      const result = this._fillModel(rows[0]);

      return [null, result];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  async isUserExist(username) {
    const existQuery = {
      text: singleLine`
          SELECT id
          FROM public.users
          WHERE username = $1
            AND delete_date ISNULL
      `,
      values: [username],
    };

    try {
      const { rowCount } = await this.#db.query(existQuery);

      return [null, rowCount > 0];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  async add(model) {
    const id = this.#identifierGenerator.generateId();
    const now = this.#dateTime.gregorianCurrentDateWithTimezoneString();

    const addQuery = {
      text: singleLine`
          INSERT INTO public.users AS u (id, username, password, role, external_oauth_data, is_enable,
                                    insert_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (username)
          WHERE delete_date ISNULL
              DO
          UPDATE
          SET username            = EXCLUDED.username,
              external_oauth_data = u.external_oauth_data || EXCLUDED.external_oauth_data
          RETURNING *
      `,
      values: [
        id,
        model.username,
        model.password,
        model.role,
        JSON.stringify(model.externalOauthData),
        true,
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

  async update(model) {
    if (typeof model.id === 'undefined') {
      return [new ModelIdNotExistException()];
    }

    const columns = [];
    /**
     * @type {Array<*>}
     */
    const params = [model.id];

    if (typeof model.username !== 'undefined') {
      params.push(model.username);
      columns.push(`username = $${params.length}`);
    }
    if (typeof model.password !== 'undefined') {
      params.push(model.password);
      columns.push(`password = $${params.length}`);
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
          UPDATE public.users
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

  /**
   *
   * @param {Object} row
   * @return {UserModel}
   * @private
   */
  _fillModel(row) {
    const model = new UserModel();

    model.id = row['id'];
    model.username = row['username'];
    model.password = row['password'];
    model.role = row['role'];
    model.externalOauthData = {
      discordId: (row['external_oauth_data'] || {})['discordId'],
    };
    model.isEnable = row['is_enable'];
    model.insertDate = this.#dateTime.gregorianDateWithTimezone(row['insert_date']);

    return model;
  }
}

module.exports = UserPgRepository;
