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

suite(`CreatePackageValidationMiddleware`, () => {
  setup(() => {
    testObj.req = new createRequest();
    testObj.res = new createResponse();

    const { createPackageValidationMiddleware } = helper.fakeCreatePackageValidationMiddleware(
      testObj.req,
      testObj.res,
    );

    testObj.createPackageValidationMiddleware = createPackageValidationMiddleware;
  });

  test(`Should error for create new package if send empty body`, async () => {
    testObj.req.body = {};

    const badCall = testObj.createPackageValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"username" is required`);
  });

  test(`Should error for create new package if count not exits`, async () => {
    testObj.req.body = { username: 'my_username' };

    const badCall = testObj.createPackageValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"count" is required`);
  });

  test(`Should error for create new package if username invalid`, async () => {
    testObj.req.body = { username: 'my$username|' };

    const badCall = testObj.createPackageValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"username" with value "my$username|" fails to match the required pattern: /^[a-zA-Z0-9_.]{3,20}/`,
      );
  });

  test(`Should error for create new package if count invalid`, async () => {
    testObj.req.body = { username: 'my_username', count: 0 };

    const badCall = testObj.createPackageValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"count" must be greater than or equal to 1`,
      );
  });

  test(`Should error for create new package if expire not exits`, async () => {
    testObj.req.body = { username: 'my_username', count: 1 };

    const badCall = testObj.createPackageValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"expire" is required`);
  });

  test(`Should error for create new package if expire not valid`, async () => {
    testObj.req.body = { username: 'my_username', count: 1, expire: '111' };

    const badCall = testObj.createPackageValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"expire" must be in YYYY-MM-DD format`,
      );
  });

  test(`Should error for create new package if expire not valid`, async () => {
    testObj.req.body = { username: 'my_username', count: 3, expire: '2021-08-25' };

    const badCall = testObj.createPackageValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message');
  });

  test(`Should successfully for create new package`, async () => {
    const expire = helper.formatDate(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
    testObj.req.body = { username: 'my_username', count: 3, expire };

    await testObj.createPackageValidationMiddleware.act();
  });
});
