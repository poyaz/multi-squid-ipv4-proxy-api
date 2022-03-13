/**
 * Created by pooya on 3/13/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const UserModel = require('~src/core/model/userModel');
const OauthModel = require('~src/core/model/oauthModel');
const UnknownException = require('~src/core/exception/unknownException');
const UserExistException = require('~src/core/exception/userExistException');
const ExternalAuthException = require('~src/core/exception/externalAuthException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`DiscordExternalAuthService`, () => {
  setup(() => {
    testObj.clientId = 'discordClientId';
    testObj.redirectUrl = 'discordRedirectUrl';

    const {
      userService,
      externalAuth,
      discordExternalAuthService,
    } = helper.fakeDiscordExternalAuthService(testObj.clientId, testObj.redirectUrl);

    testObj.userService = userService;
    testObj.externalAuth = externalAuth;
    testObj.discordExternalAuthService = discordExternalAuthService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
  });

  suite(`Get discord auth options`, () => {
    test(`Should successfully get discord auth options`, async () => {
      const platform = 'discord';

      const [error, result] = await testObj.discordExternalAuthService.getOptions(platform);

      expect(error).to.be.a('null');
      expect(result).to.be.a('object').and.have.include({
        id: testObj.clientId,
        platform: 'discord',
        redirectUrl: testObj.redirectUrl,
      });
    });
  });

  suite(`Discord auth`, () => {
    test(`Should error auth in discord platform`, async () => {
      const platform = 'discord';
      const authError = new Error('Auth error');
      testObj.externalAuth.generateAuthUrl.throws(authError);

      const [error] = await testObj.discordExternalAuthService.auth(platform);

      testObj.externalAuth.generateAuthUrl.should.have.callCount(1);
      testObj.externalAuth.generateAuthUrl.should.have.calledWith(
        sinon.match
          .has('grantType', 'authorization_code')
          .and(sinon.match.has('scope', sinon.match.array.deepEquals(['identify']))),
      );
      expect(error).to.be.an.instanceof(ExternalAuthException);
      expect(error).to.have.property('errorInfo', authError);
    });

    test(`Should successfully auth in discord platform`, async () => {
      const platform = 'discord';
      testObj.externalAuth.generateAuthUrl.returns('authRedirectUrl');

      const [error, result] = await testObj.discordExternalAuthService.auth(platform);

      testObj.externalAuth.generateAuthUrl.should.have.callCount(1);
      testObj.externalAuth.generateAuthUrl.should.have.calledWith(
        sinon.match
          .has('grantType', 'authorization_code')
          .and(sinon.match.has('scope', sinon.match.array.deepEquals(['identify']))),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.equal('authRedirectUrl');
    });
  });
});
