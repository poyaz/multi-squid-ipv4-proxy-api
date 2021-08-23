/**
 * Created by pooya on 8/23/21.
 */

const { singleLine } = require('~src/utility');
const IUserRepository = require('~src/core/interface/iUserRepository');

const UserModel = require('~src/core/model/userModel');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');

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

  async add(model) {
    const id = this.#identifierGenerator.generateId();
    const now = this.#dateTime.gregorianCurrentDateWithTimezoneString();

    const fetchCombosQuery = {
      text: singleLine`
          INSERT INTO public.users (id, username, password, is_enable, insert_date)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (username)
          WHERE delete_date ISNULL
              DO
          UPDATE
          SET username = EXCLUDED.username
      `,
      values: [id, model.username, model.password, true, now],
    };

    try {
      const { rows } = await this.#db.query(fetchCombosQuery);

      const result = this._fillModel(rows[0]);

      return [null, result];
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
    model.isEnable = row['is_enable'];
    model.insertDate = this.#dateTime.gregorianDateWithTimezone(row['insert_date']);

    return model;
  }
}

module.exports = UserPgRepository;
