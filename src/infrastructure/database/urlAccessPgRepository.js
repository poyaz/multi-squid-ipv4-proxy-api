/**
 * Created by pooya on 8/28/21.
 */

const { singleLine } = require('~src/utility');
const UrlAccessModel = require('~src/core/model/urlAccessModel');
const IUrlAccessRepository = require('~src/core/interface/iUrlAccessRepository');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');

class UrlAccessPgRepository extends IUrlAccessRepository {
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

    const blockUrlList = model.urlList.filter((v) => v.isBlock).map((v) => v.url);
    const startDate = this.#dateTime.gregorianWithTimezoneString(model.startDate);
    const endDate = this.#dateTime.gregorianWithTimezoneString(model.endDate);

    const addQuery = {
      text: singleLine`
          INSERT INTO public.access_url (id, user_id, url_list, is_block, start_date, end_date, insert_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
      `,
      values: [id, model.userId, blockUrlList, true, startDate, endDate, now],
    };

    try {
      const { rows } = await this.#db.query(addQuery);

      const result = this._fillModel(rows[0]);
      result.username = model.username;

      return [null, result];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  async checkBlockDomainByUserId(userId, domain) {
    const now = this.#dateTime.gregorianCurrentDateWithTimezoneString();

    const checkBlockQuery = {
      text: singleLine`
          SELECT id
          FROM public.access_url
          WHERE delete_date ISNULL
            AND is_block = true
            AND user_id = $1
            AND url_list @> $2
            AND $3 BETWEEN start_date AND end_date;
      `,
      values: [userId, [domain], now],
    };

    try {
      const { rowCount } = await this.#db.query(checkBlockQuery);

      const result = rowCount > 0;

      return [null, result];
    } catch (error) {
      return [new DatabaseExecuteException(error)];
    }
  }

  _fillModel(row) {
    const model = new UrlAccessModel();
    model.id = row['id'];
    model.userId = row['user_id'];
    model.username = row['username'];
    model.urlList = (row['url_list'] || []).map((v) => ({
      url: v,
      isBlock: row['is_block'] || false,
    }));
    model.startDate = row['start_date'];
    model.endDate = row['end_date'];
    model.insertDate = row['insert_date'];

    return model;
  }
}

module.exports = UrlAccessPgRepository;
