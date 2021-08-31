/**
 * Created by pooya on 8/31/21.
 */

const { singleLine } = require('~src/utility');
const JobModel = require('~src/core/model/jobModel');
const IJobRepository = require('~src/core/interface/iJobRepository');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');

class JobRepository extends IJobRepository {
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
                 data,
                 status,
                 total_record,
                 total_record_add,
                 total_record_exist,
                 total_record_error,
                 insert_date
          FROM public.jobs
          WHERE delete_date ISNULL
            AND id = $1
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

  _fillModel(row) {
    const model = new JobModel();
    model.id = row['id'];
    model.data = row['data'];
    model.status = row['status'];
    model.totalRecord = row['total_record'];
    model.totalRecordAdd = row['total_record_add'];
    model.totalRecordExist = row['total_record_exist'];
    model.totalRecordError = row['total_record_error'];

    return model;
  }
}

module.exports = JobRepository;
