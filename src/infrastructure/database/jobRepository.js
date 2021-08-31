/**
 * Created by pooya on 8/31/21.
 */

const { singleLine } = require('~src/utility');
const JobModel = require('~src/core/model/jobModel');
const IJobRepository = require('~src/core/interface/iJobRepository');
const ModelIdNotExistException = require('~src/core/exception/modelIdNotExistException');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');
const DatabaseMinParamUpdateException = require('~src/core/exception/databaseMinParamUpdateException');

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

  async add(model) {
    const id = this.#identifierGenerator.generateId();
    const now = this.#dateTime.gregorianCurrentDateWithTimezoneString();

    const addQuery = {
      text: singleLine`
          INSERT INTO public.jobs (id, data, status, insert_date)
          VALUES ($1, $2, $3, $4)
      `,
      values: [id, model.data, model.status, now],
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

    if (typeof model.status !== 'undefined') {
      param.push(model.status);
      columns.push(`status = ${param.length}`);
    }
    if (typeof model.totalRecord !== 'undefined') {
      param.push(model.totalRecord);
      columns.push(`total_record = ${param.length}`);
    }
    if (typeof model.totalRecordAdd !== 'undefined') {
      param.push(model.totalRecordAdd);
      columns.push(`total_record_add = ${param.length}`);
    }
    if (typeof model.totalRecordExist !== 'undefined') {
      param.push(model.totalRecordExist);
      columns.push(`total_record_exist = ${param.length}`);
    }
    if (typeof model.totalRecordError !== 'undefined') {
      param.push(model.totalRecordError);
      columns.push(`total_record_error = ${param.length}`);
    }

    if (columns.length === 0) {
      return [new DatabaseMinParamUpdateException()];
    }

    param.push(this.#dateTime.gregorianCurrentDateWithTimezoneString());
    columns.push(`update_date = ${param.length}`);

    const updateQuery = {
      sql: singleLine`
          UPDATE public.jobs
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

  _fillModel(row) {
    const model = new JobModel();
    model.id = row['id'];
    model.data = row['data'];
    model.status = row['status'];
    model.totalRecord = row['total_record'];
    model.totalRecordAdd = row['total_record_add'];
    model.totalRecordExist = row['total_record_exist'];
    model.totalRecordError = row['total_record_error'];
    model.insertDate = this.#dateTime.gregorianDateWithTimezone(row['insert_date']);

    return model;
  }
}

module.exports = JobRepository;