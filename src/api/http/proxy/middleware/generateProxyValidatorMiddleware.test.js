/**
 * Created by pooya on 8/29/21.
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

suite(`GenerateProxyValidatorMiddleware`, () => {
  setup(() => {
    testObj.req = new createRequest();
    testObj.res = new createResponse();

    const { generateProxyValidatorMiddleware } = helper.fakeGenerateProxyValidationMiddleware(
      testObj.req,
      testObj.res,
    );

    testObj.generateProxyValidatorMiddleware = generateProxyValidatorMiddleware;
  });

  test(`Should error for init proxy if send empty body`, async () => {
    testObj.req.body = {};

    const badCall = testObj.generateProxyValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"ip" is required`);
  });

  test(`Should error for init proxy if ip invalid`, async () => {
    testObj.req.body = { ip: 'my$username|' };

    const badCall = testObj.generateProxyValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"ip" must be a valid ip address of one of the following versions [ipv4] with a optional CIDR`,
      );
  });

  test(`Should error for init proxy if mask not exist`, async () => {
    testObj.req.body = { ip: '192.168.1.2' };

    const badCall = testObj.generateProxyValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"mask" is required`);
  });

  test(`Should error for init proxy if mask invalid`, async () => {
    testObj.req.body = { ip: '192.168.1.2', mask: 33 };

    const badCall = testObj.generateProxyValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"mask" must be less than or equal to 32`,
      );
  });

  test(`Should error for init proxy if gateway not exits`, async () => {
    testObj.req.body = { ip: '192.168.1.2', mask: 32 };

    const badCall = testObj.generateProxyValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"gateway" is required`);
  });

  test(`Should error for init proxy if gateway not valid`, async () => {
    testObj.req.body = { ip: '192.168.1.2', mask: 32, gateway: 'asdas' };

    const badCall = testObj.generateProxyValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"gateway" must be a valid ip address of one of the following versions [ipv4] with a optional CIDR`,
      );
  });

  test(`Should error for init proxy if interface not exist`, async () => {
    testObj.req.body = { ip: '192.168.1.2', mask: 32, gateway: '192.168.1.1' };

    const badCall = testObj.generateProxyValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"interface" is required`);
  });

  test(`Should error for init proxy if interface empty`, async () => {
    testObj.req.body = { ip: '192.168.1.2', mask: 32, gateway: '192.168.1.1', interface: '' };

    const badCall = testObj.generateProxyValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"interface" is not allowed to be empty`,
      );
  });

  test(`Should error for init proxy if type not exist`, async () => {
    testObj.req.body = { ip: '192.168.1.2', mask: 32, gateway: '192.168.1.1', interface: 'ens192' };

    const badCall = testObj.generateProxyValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"type" is required`);
  });

  test(`Should error for init proxy if type not valid`, async () => {
    testObj.req.body = {
      ip: '192.168.1.2',
      mask: 32,
      gateway: '192.168.1.1',
      interface: 'ens192',
      type: 'abc',
    };

    const badCall = testObj.generateProxyValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"type" must be one of [isp, dc]`);
  });

  test(`Should error for init proxy if country not exist`, async () => {
    testObj.req.body = {
      ip: '192.168.1.2',
      mask: 32,
      gateway: '192.168.1.1',
      interface: 'ens192',
      type: 'isp',
    };

    const badCall = testObj.generateProxyValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"country" is required`);
  });

  test(`Should error for init proxy if country not valid`, async () => {
    testObj.req.body = {
      ip: '192.168.1.2',
      mask: 32,
      gateway: '192.168.1.1',
      interface: 'ens192',
      type: 'isp',
      country: 'ab',
    };

    const badCall = testObj.generateProxyValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `must be a valid country code`);
  });

  test(`Should successfully for init proxy`, async () => {
    testObj.req.body = {
      ip: '192.168.1.2',
      mask: 32,
      gateway: '192.168.1.1',
      interface: 'ens192',
      type: 'isp',
      country: 'GB',
    };

    await testObj.generateProxyValidatorMiddleware.act();
  });
});
