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

suite(`DeleteProxyIpValidatorMiddleware`, () => {
  setup(() => {
    testObj.req = new createRequest();
    testObj.res = new createResponse();

    const { deleteProxyIpValidatorMiddleware } = helper.fakeDeleteProxyIpValidationMiddleware(
      testObj.req,
      testObj.res,
    );

    testObj.deleteProxyIpValidatorMiddleware = deleteProxyIpValidatorMiddleware;
  });

  test(`Should error for init proxy if send empty body`, async () => {
    testObj.req.body = {};

    const badCall = testObj.deleteProxyIpValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"ip" is required`);
  });

  test(`Should error for init proxy if ip invalid`, async () => {
    testObj.req.body = { ip: 'my$username|' };

    const badCall = testObj.deleteProxyIpValidatorMiddleware.act();

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

    const badCall = testObj.deleteProxyIpValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"mask" is required`);
  });

  test(`Should error for init proxy if mask invalid`, async () => {
    testObj.req.body = { ip: '192.168.1.2', mask: 33 };

    const badCall = testObj.deleteProxyIpValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"mask" must be less than or equal to 32`,
      );
  });

  test(`Should error for init proxy if interface not exist`, async () => {
    testObj.req.body = { ip: '192.168.1.2', mask: 32 };

    const badCall = testObj.deleteProxyIpValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property('additionalInfo[0].message', `"interface" is required`);
  });

  test(`Should error for init proxy if interface empty`, async () => {
    testObj.req.body = { ip: '192.168.1.2', mask: 32, interface: '' };

    const badCall = testObj.deleteProxyIpValidatorMiddleware.act();

    await expect(badCall)
      .to.eventually.have.rejectedWith(SchemaValidatorException)
      .and.have.property('httpCode', 400)
      .and.have.nested.property(
        'additionalInfo[0].message',
        `"interface" is not allowed to be empty`,
      );
  });

  test(`Should successfully for init proxy`, async () => {
    testObj.req.body = { ip: '192.168.1.2', mask: 32, interface: 'ens192' };

    await testObj.deleteProxyIpValidatorMiddleware.act();
  });
});
