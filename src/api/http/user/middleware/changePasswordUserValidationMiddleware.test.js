/**
 * Created by pooya on 8/25/21.
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

suite(`ChangePasswordUserValidationMiddleware`, () => {
  setup(() => {
    testObj.req = new createRequest();
    testObj.res = new createResponse();

    const { changePasswordUserValidationMiddleware } = helper.fakePasswordUserValidationMiddleware(
      testObj.req,
      testObj.res,
    );

    testObj.changePasswordUserValidationMiddleware = changePasswordUserValidationMiddleware;
  });

  test(`Should error for change password if send empty body`, async () => {
    testObj.req.body = {};

    const badCall = testObj.changePasswordUserValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"password" is required`);
  });

  test(`Should error for change password if password invalid`, async () => {
    testObj.req.body = { password: '123' };

    const badCall = testObj.changePasswordUserValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"password" length must be at least 6 characters long`,
      );
  });

  test(`Should successfully change password`, async () => {
    testObj.req.body = { password: '123456' };

    await testObj.changePasswordUserValidationMiddleware.act();
  });
});
