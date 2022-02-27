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

suite(`AddServerValidation`, () => {
  setup(() => {
    testObj.req = new createRequest();
    testObj.res = new createResponse();

    const { addServerValidationMiddleware } = helper.fakeAddServerValidationMiddleware(
      testObj.req,
      testObj.res,
    );

    testObj.addServerValidationMiddleware = addServerValidationMiddleware;
  });

  test(`Should error for add new server if send empty body`, async () => {
    testObj.req.body = {};

    const badCall = testObj.addServerValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"name" is required`);
  });

  test(`Should error for add new server if ipRange not exits`, async () => {
    testObj.req.body = { name: 'server-1' };

    const badCall = testObj.addServerValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"ipRange" is required`);
  });

  test(`Should error for add new server if hostIpAddress not exits`, async () => {
    testObj.req.body = { name: 'server-1', ipRange: ['192.168.1.1/24'] };

    const badCall = testObj.addServerValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"hostIpAddress" is required`);
  });

  test(`Should error for add new server if hostApiPort not exits`, async () => {
    testObj.req.body = {
      name: 'server-1',
      ipRange: ['192.168.1.1/24'],
      hostIpAddress: '10.10.10.1',
    };

    const badCall = testObj.addServerValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"hostApiPort" is required`);
  });

  test(`Should error for add new server if name invalid`, async () => {
    testObj.req.body = {
      name: 's1',
      ipRange: ['192.168.1.1/24'],
      hostIpAddress: '10.10.10.1',
      hostApiPort: 8080,
    };

    const badCall = testObj.addServerValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"name" length must be at least 3 characters long`,
      );
  });

  test(`Should error for add new server if ipRange is empty array`, async () => {
    testObj.req.body = {
      name: 'server-1',
      ipRange: [],
      hostIpAddress: '10.10.10.1',
      hostApiPort: 8080,
    };

    const badCall = testObj.addServerValidationMiddleware.act();

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

    const badCall = testObj.addServerValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"ipRange[0]" must be a valid ip address of one of the following versions [ipv4] with a required CIDR`,
      );
  });

  test(`Should error for add new server if hostIpAddress is invalid (check with hostname)`, async () => {
    testObj.req.body = {
      name: 'server-1',
      ipRange: ['192.168.1.1/24'],
      hostIpAddress: '1',
      hostApiPort: 8080,
    };

    const badCall = testObj.addServerValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"hostIpAddress" does not match any of the allowed types`,
      );
  });

  test(`Should error for add new server if hostIpAddress is invalid (check with ip)`, async () => {
    testObj.req.body = {
      name: 'server-1',
      ipRange: ['192.168.1.1/24'],
      hostIpAddress: '10.10.10.10/23',
      hostApiPort: 8080,
    };

    const badCall = testObj.addServerValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"hostIpAddress" does not match any of the allowed types`,
      );
  });

  test(`Should error for add new server if internalHostIpAddress is invalid (check with hostname)`, async () => {
    testObj.req.body = {
      name: 'server-1',
      ipRange: ['192.168.1.1/24'],
      hostIpAddress: '10.10.10.10',
      internalHostIpAddress: '1',
      hostApiPort: 8080,
    };

    const badCall = testObj.addServerValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"internalHostIpAddress" does not match any of the allowed types`,
      );
  });

  test(`Should error for add new server if internalHostIpAddress is invalid (check with ip)`, async () => {
    testObj.req.body = {
      name: 'server-1',
      ipRange: ['192.168.1.1/24'],
      hostIpAddress: '10.10.10.10',
      internalHostIpAddress: '10.10.10.10/23',
      hostApiPort: 8080,
    };

    const badCall = testObj.addServerValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"internalHostIpAddress" does not match any of the allowed types`,
      );
  });

  test(`Should error for add new server if hostApiPort is invalid`, async () => {
    testObj.req.body = {
      name: 'server-1',
      ipRange: ['192.168.1.1/24'],
      hostIpAddress: '10.10.10.10',
      hostApiPort: 'ss',
    };

    const badCall = testObj.addServerValidationMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"hostApiPort" must be a number`);
  });

  test(`Should successfully for add new server`, async () => {
    testObj.req.body = {
      name: 'server-1',
      ipRange: ['192.168.1.1/24'],
      hostIpAddress: '10.10.10.10',
      hostApiPort: 8080,
    };

    await testObj.addServerValidationMiddleware.act();
  });
});
