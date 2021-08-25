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
      filterConditions.push(`username = ${getAllQuery.values.length}`);
    }
    if (typeof filterModel.isEnable !== 'undefined') {
      getAllQuery.values.push(filterModel.isEnable);
      filterConditions.push(`is_enable = ${getAllQuery.values.length}`);
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
          INSERT INTO public.users (id, username, is_enable, insert_date)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (username)
          WHERE delete_date ISNULL
              DO
          UPDATE
          SET username = EXCLUDED.username
      `,
      values: [id, model.username, true, now],
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
    const param = [model.id];

    if (typeof model.username !== 'undefined') {
      param.push(model.username);
      columns.push(`username = ${param.length}`);
    }
    if (typeof model.isEnable !== 'undefined') {
      param.push(model.isEnable);
      columns.push(`is_enable = ${param.length}`);
    }

    if (columns.length === 0) {
      return [new DatabaseMinParamUpdateException()];
    }

    param.push(this.#dateTime.gregorianCurrentDateWithTimezoneString());
    columns.push(`update_date = ${param.length}`);

    const updateQuery = {
      sql: singleLine`
          UPDATE public.users
          SET ${columns.join(', ')}
          WHERE delete_date ISNULL
            AND id = $1
      `,
      values: [...param],
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
    model.password = '';
    model.isEnable = row['is_enable'];
    model.insertDate = this.#dateTime.gregorianDateWithTimezone(row['insert_date']);

    return model;
  }
}

module.exports = UserPgRepository;
