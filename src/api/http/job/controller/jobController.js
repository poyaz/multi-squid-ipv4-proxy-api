/**
 * Created by pooya on 8/31/21.
 */

const GetByIdOutputModel = require('./model/getByIdOutputModel');

class JobController {
  #req;
  #res;
  /**
   * @type {IJobService}
   */
  #jobService;
  /**
   * @type {IDateTime}
   */
  #dateTime;

  /**
   *
   * @param req
   * @param res
   * @param {IJobService} jobService
   * @param {IDateTime} dateTime
   */
  constructor(req, res, jobService, dateTime) {
    this.#req = req;
    this.#res = res;
    this.#jobService = jobService;
    this.#dateTime = dateTime;
  }

  async getJobById() {
    const { jobId } = this.#req.params;

    const [error, data] = await this.#jobService.getById(jobId);
    if (error) {
      return [error];
    }

    const getByIdOutputModel = new GetByIdOutputModel(this.#dateTime);
    const result = getByIdOutputModel.getOutput(data);

    return [null, result];
  }
}

module.exports = JobController;
