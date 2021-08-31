/**
 * Created by pooya on 8/30/21.
 */

const JobController = require('./jobController');

class JobControllerFactory {
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
   * @param {IJobService} jobService
   * @param {IDateTime} dateTime
   */
  constructor(jobService, dateTime) {
    this.#jobService = jobService;
    this.#dateTime = dateTime;
  }

  /**
   *
   * @param req
   * @param res
   * @return {JobController}
   */
  create(req, res) {
    return new JobController(req, res, this.#jobService, this.#dateTime);
  }
}

module.exports = JobControllerFactory;
