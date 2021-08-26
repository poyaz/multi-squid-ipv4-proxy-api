/**
 * Created by pooya on 8/26/21.
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

suite(`RenewPackageValidatorMiddleware`, () => {
  setup(() => {
    testObj.req = new createRequest();
    testObj.res = new createResponse();

    const { renewPackageValidatorMiddleware } = helper.fakeRenewPackageValidationMiddleware(
      testObj.req,
      testObj.res,
    );

    testObj.renewPackageValidatorMiddleware = renewPackageValidatorMiddleware;
  });

  test(`Should error for create new package if send empty body`, async () => {
    testObj.req.body = {};

    const badCall = testObj.renewPackageValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"expire" is required`);
  });

  test(`Should error for create new package if expire not valid`, async () => {
    testObj.req.body = { expire: '111' };

    const badCall = testObj.renewPackageValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"expire" must be in YYYY-MM-DD format`,
      );
  });

  test(`Should error for create new package if expire not valid`, async () => {
    testObj.req.body = { expire: '2021-08-25' };

    const badCall = testObj.renewPackageValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message');
  });

  test(`Should successfully for create new package`, async () => {
    const expire = helper.formatDate(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
    testObj.req.body = { expire };

    await testObj.renewPackageValidatorMiddleware.act();
  });
});
