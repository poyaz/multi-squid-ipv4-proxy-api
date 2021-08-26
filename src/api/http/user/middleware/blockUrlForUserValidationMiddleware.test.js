/**
 * Created by pooya on 8/23/21.
 */

const chai = require('chai');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const { createRequest, createResponse } = require('node-mocks-http');

const helper = require('~src/helper');

const SchemaValidatorException = require('~src/core/exception/schemaValidatorException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
chai.use(chaiAsPromised);

/**
 * @property eventually
 * @property rejectedWith
 */
const expect = chai.expect;
const testObj = {};

suite(`BlockUrlForUserValidationMiddleware`, () => {
  setup(() => {
    testObj.req = new createRequest();
    testObj.res = new createResponse();

    const { blockUrlForUserValidationMiddleware } = helper.fakeBlockUrlForUserValidationMiddleware(
      testObj.req,
      testObj.res,
    );

    testObj.blockUrlForUserValidationMiddleware = blockUrlForUserValidationMiddleware;
  });

  test(`Should error for add new blacklist if send empty body`, async () => {
    testObj.req.body = {};

    const badCall = testObj.blockUrlForUserValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"urls" is required`);
  });

  test(`Should error for add new blacklist if urls not valid`, async () => {
    testObj.req.body = { urls: '' };

    const badCall = testObj.blockUrlForUserValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"urls" must be an array`);
  });

  test(`Should error for add new blacklist if startDate not exits`, async () => {
    testObj.req.body = { urls: ['google.com'] };

    const badCall = testObj.blockUrlForUserValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"startDate" is required`);
  });

  test(`Should error for add new blacklist if startDate not valid`, async () => {
    testObj.req.body = { urls: ['google.com'], startDate: '111' };

    const badCall = testObj.blockUrlForUserValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"startDate" must be in YYYY-MM-DD HH:mm:ss format`,
      );
  });

  test(`Should error for add new blacklist if startDate less than now`, async () => {
    testObj.req.body = { urls: ['google.com'], startDate: '2021-08-25 09:10:20' };

    const badCall = testObj.blockUrlForUserValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message');
  });

  test(`Should error for add new blacklist if endDate not exits`, async () => {
    const startDate = `${helper.formatDate(
      new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    )} 12:10:20`;
    testObj.req.body = { urls: ['google.com'], startDate };

    const badCall = testObj.blockUrlForUserValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"endDate" is required`);
  });

  test(`Should error for add new blacklist if endDate not valid`, async () => {
    const startDate = `${helper.formatDate(
      new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    )} 12:10:20`;
    testObj.req.body = { urls: ['google.com'], startDate, endDate: '111' };

    const badCall = testObj.blockUrlForUserValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"endDate" must be in YYYY-MM-DD HH:mm:ss format`,
      );
  });

  test(`Should error for add new blacklist if endDate less than now`, async () => {
    const startDate = `${helper.formatDate(
      new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    )} 12:10:20`;
    testObj.req.body = { urls: ['google.com'], startDate, endDate: '2021-08-25 09:10:20' };

    const badCall = testObj.blockUrlForUserValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message');
  });

  test(`Should successfully for add new blacklist`, async () => {
    const startDate = `${helper.formatDate(
      new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    )} 12:10:20`;
    const endDate = `${helper.formatDate(
      new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    )} 13:10:20`;
    testObj.req.body = { urls: ['google.com'], startDate, endDate };

    await testObj.blockUrlForUserValidationMiddleware.act();
  });
});
