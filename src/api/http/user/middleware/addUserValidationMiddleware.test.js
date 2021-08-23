/**
 * Created by pooya on 8/23/21.
 */

const chai = require('chai');
const sinon = require('sinon');
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

suite(`AddUserValidation`, () => {
  setup(() => {
    testObj.req = new createRequest();
    testObj.res = new createResponse();

    const { addUserValidationMiddleware } = helper.fakeAddUserValidationMiddleware(
      testObj.req,
      testObj.res,
    );

    testObj.addUserValidationMiddleware = addUserValidationMiddleware;
  });

  test(`Should error for add new user if send empty body`, async () => {
    testObj.req.body = {};

    const badCall = testObj.addUserValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"username" is required`);
  });

  test(`Should error for add new user if password not exits`, async () => {
    testObj.req.body = { username: 'my_username' };

    const badCall = testObj.addUserValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"password" is required`);
  });

  test(`Should error for add new user if username invalid`, async () => {
    testObj.req.body = { username: 'my$username|', password: '123456' };

    const badCall = testObj.addUserValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"username" with value "my$username|" fails to match the required pattern: /^[a-zA-Z0-9_.]{3,20}/`,
      );
  });

  test(`Should error for add new user if password invalid`, async () => {
    testObj.req.body = { username: 'my_username', password: '123' };

    const badCall = testObj.addUserValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"password" length must be at least 6 characters long`,
      );
  });

  test(`Should error for add new user if password invalid`, async () => {
    testObj.req.body = { username: 'my_username', password: '123456' };

    await testObj.addUserValidationMiddleware.act();
  });
});
