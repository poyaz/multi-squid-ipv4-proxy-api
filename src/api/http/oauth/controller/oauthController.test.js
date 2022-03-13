/**
 * Created by pooya on 3/13/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const { createRequest, createResponse } = require('node-mocks-http');

const helper = require('~src/helper');

const OauthModel = require('~src/core/model/oauthModel');
const UnknownException = require('~src/core/exception/unknownException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
chai.use(chaiAsPromised);

const expect = chai.expect;
const testObj = {};

suite(`OauthController`, () => {
  setup(() => {
    testObj.req = new createRequest();
    testObj.res = new createResponse();

    const { externalAuthService, oauthController } = helper.fakeOauthController(
      testObj.req,
      testObj.res,
    );

    testObj.externalAuthService = externalAuthService;
    testObj.oauthController = oauthController;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.dateRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/;
    testObj.expireRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
  });

  suite(`Get oauth options`, () => {
    test(`Should error get oauth options for platform`, async () => {
      testObj.req.params = { platform: 'discord' };
      testObj.externalAuthService.getOptions.resolves([new UnknownException()]);

      const [error] = await testObj.oauthController.getOptions();

      testObj.externalAuthService.getOptions.should.have.callCount(1);
      testObj.externalAuthService.getOptions.should.have.calledWith(sinon.match('discord'));
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully get oauth options for platform`, async () => {
      testObj.req.params = { platform: 'discord' };
      const outputModel = new OauthModel();
      outputModel.id = 'platformId';
      outputModel.platform = 'discord';
      outputModel.redirectUrl = 'callbackUrl';
      testObj.externalAuthService.getOptions.resolves([null, outputModel]);

      const [error, result] = await testObj.oauthController.getOptions();

      testObj.externalAuthService.getOptions.should.have.callCount(1);
      testObj.externalAuthService.getOptions.should.have.calledWith(sinon.match('discord'));
      expect(error).to.be.a('null');
      expect(result).to.be.a('object').and.have.include({
        id: 'platformId',
        platform: 'discord',
        redirectUrl: 'callbackUrl',
      });
    });
  });

  suite(`Authenticate with oauth`, () => {
    test(`Should error authenticate with oauth`, async () => {
      testObj.req.params = { platform: 'discord' };
      testObj.externalAuthService.auth.resolves([new UnknownException()]);

      const [error] = await testObj.oauthController.auth();

      testObj.externalAuthService.auth.should.have.callCount(1);
      testObj.externalAuthService.auth.should.have.calledWith(sinon.match('discord'));
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully authenticate with oauth and get redirect url`, async () => {
      testObj.req.params = { platform: 'discord' };
      testObj.externalAuthService.auth.resolves([null, 'redirectUrl']);

      const [error, result] = await testObj.oauthController.auth();

      testObj.externalAuthService.auth.should.have.callCount(1);
      testObj.externalAuthService.auth.should.have.calledWith(sinon.match('discord'));
      expect(error).to.be.a('null');
      expect(result).to.be.equal('redirectUrl');
    });
  });
});
