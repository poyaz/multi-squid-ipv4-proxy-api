/**
 * Created by pooya on 8/23/21.
 */

const UrlAccessModel = require('~src/core/model/urlAccessModel');

class BlockUrlForUserInputModel {
  /**
   * @type {IDateTime}
   */
  #dateTime;
  /**
   * @type {string}
   */
  #username;

  /**
   *
   * @param {IDateTime} dateTime
   * @param {string} username
   */
  constructor(dateTime, username) {
    this.#dateTime = dateTime;
    this.#username = username;
  }

  /**
   *
   * @param body
   * @return {UrlAccessModel}
   */
  getModel(body) {
    const model = new UrlAccessModel();
    model.username = this.#username;
    model.urlList = body.urls.map((v) => ({ url: v, isBlock: true }));
    model.startDate = this.#dateTime.gregorianDateWithTimezone(body.startDate);
    model.endDate = this.#dateTime.gregorianDateWithTimezone(body.endDate);

    return model;
  }
}

module.exports = BlockUrlForUserInputModel;
