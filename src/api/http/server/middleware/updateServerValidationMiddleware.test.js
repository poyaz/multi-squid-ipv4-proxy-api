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

suite(`UpdateServerValidation`, () => {
  setup(() => {
    testObj.req = new createRequest();
    testObj.res = new createResponse();

    const { updateServerValidationMiddleware } = helper.fakeUpdateServerValidationMiddleware(
      testObj.req,
      testObj.res,
    );

    testObj.updateServerValidationMiddleware = updateServerValidationMiddleware;
  });

  test(`Should error for update server if send empty body`, async () => {
    testObj.req.body = {};

    const badCall = testObj.updateServerValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"value" must contain at least one of [name, ipRange, hostIpAddress, hostApiPort, isEnable]`,
      );
  });

  test(`Should error for update server if name invalid`, async () => {
    testObj.req.body = {
      name: 's1',
    };

    const badCall = testObj.updateServerValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"name" length must be at least 3 characters long`,
      );
  });

  test(`Should error for update server if ipRange is empty array`, async () => {
    testObj.req.body = {
      ipRange: [],
    };

    const badCall = testObj.updateServerValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"ipRange" does not contain 1 required value(s)`,
      );
  });

  test(`Should error for update server if ipRange is invalid`, async () => {
    testObj.req.body = {
      ipRange: ['host'],
    };

    const badCall = testObj.updateServerValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"ipRange[0]" must be a valid ip address of one of the following versions [ipv4] with a required CIDR`,
      );
  });

  test(`Should error for update server if hostIpAddress is invalid (check with hostname)`, async () => {
    testObj.req.body = {
      hostIpAddress: '1',
    };

    const badCall = testObj.updateServerValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"hostIpAddress" does not match any of the allowed types`,
      );
  });

  test(`Should error for update server if hostIpAddress is invalid (check with ip)`, async () => {
    testObj.req.body = {
      hostIpAddress: '10.10.10.10/23',
    };

    const badCall = testObj.updateServerValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"hostIpAddress" does not match any of the allowed types`,
      );
  });

  test(`Should error for update server if hostApiPort is invalid`, async () => {
    testObj.req.body = {
      hostApiPort: 'ss',
    };

    const badCall = testObj.updateServerValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"hostApiPort" must be a number`);
  });

  test(`Should error for update server if isEnable is invalid`, async () => {
    testObj.req.body = {
      isEnable: 'off',
    };

    const badCall = testObj.updateServerValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"isEnable" must be a boolean`);
  });

  test(`Should successfully for update server`, async () => {
    testObj.req.body = {
      name: 'server-1',
      ipRange: ['192.168.1.1/24'],
      hostIpAddress: '10.10.10.10',
      hostApiPort: 8080,
      isEnable: true,
    };

    await testObj.updateServerValidationMiddleware.act();
  });
});
