/**
 * Created by pooya on 2/12/22.
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

suite(`AppendIpRangeValidation`, () => {
  setup(() => {
    testObj.req = new createRequest();
    testObj.res = new createResponse();

    const { appendIpRangeValidationMiddleware } = helper.fakeAppendIpRangeValidationMiddleware(
      testObj.req,
      testObj.res,
    );

    testObj.appendIpRangeValidationMiddleware = appendIpRangeValidationMiddleware;
  });

  test(`Should error for add new server if send empty body`, async () => {
    testObj.req.body = {};

    const badCall = testObj.appendIpRangeValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"ipRange" is required`);
  });

  test(`Should error for add new server if ipRange is empty array`, async () => {
    testObj.req.body = {
      name: 'server-1',
      ipRange: [],
      hostIpAddress: '10.10.10.1',
      hostApiPort: 8080,
    };

    const badCall = testObj.appendIpRangeValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"ipRange" does not contain 1 required value(s)`,
      );
  });

  test(`Should error for add new server if ipRange is invalid`, async () => {
    testObj.req.body = {
      name: 'server-1',
      ipRange: ['host'],
      hostIpAddress: '10.10.10.1',
      hostApiPort: 8080,
    };

    const badCall = testObj.appendIpRangeValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"ipRange[0]" must be a valid ip address of one of the following versions [ipv4] with a required CIDR`,
      );
  });

  test(`Should successfully for add new server`, async () => {
    testObj.req.body = {
      ipRange: ['192.168.1.1/24'],
    };

    await testObj.appendIpRangeValidationMiddleware.act();
  });
});
