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
      const inputPlatform = 'discord';

      const [error, result] = await testObj.discordExternalAuthService.getOptions(inputPlatform);

      expect(error).to.be.a('null');
      expect(result.length).to.be.equal(1);
      expect(result[0]).to.be.a('object').and.have.include({
        id: testObj.clientId,
        platform: 'discord',
        redirectUrl: testObj.redirectUrl,
      });
    });
  });

  suite(`Discord auth`, () => {
    test(`Should error auth in discord platform`, async () => {
      const inputPlatform = 'discord';
      const authError = new Error('Auth error');
      testObj.externalAuth.generateAuthUrl.throws(authError);

      const [error] = await testObj.discordExternalAuthService.auth(inputPlatform);

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
      const inputPlatform = 'discord';
      testObj.externalAuth.generateAuthUrl.returns('authRedirectUrl');

      const [error, result] = await testObj.discordExternalAuthService.auth(inputPlatform);

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

  suite(`Verify auth user`, () => {
    test(`Should error verify auth user when get token access`, async () => {
      const inputPlatform = 'discord';
      const inputCode = 'code';
      const tokenError = new Error('Auth error');
      testObj.externalAuth.tokenRequest.throws(tokenError);

      const [error] = await testObj.discordExternalAuthService.verify(inputPlatform, inputCode);

      testObj.externalAuth.tokenRequest.should.have.callCount(1);
      testObj.externalAuth.tokenRequest.should.have.calledWith(
        sinon.match
          .has('code', inputCode)
          .and(sinon.match.has('grantType', 'authorization_code'))
          .and(sinon.match.has('scope', sinon.match.array.deepEquals(['identify']))),
      );
      expect(error).to.be.an.instanceof(ExternalAuthException);
      expect(error).to.have.property('errorInfo', tokenError);
    });

    test(`Should error verify auth user when get user info`, async () => {
      const inputPlatform = 'discord';
      const inputCode = 'code';
      const outputTokenObj = {
        access_token: 'accessToken',
      };
      testObj.externalAuth.tokenRequest.resolves(outputTokenObj);
      const userError = new Error('Auth error');
      testObj.externalAuth.getUser.throws(userError);

      const [error] = await testObj.discordExternalAuthService.verify(inputPlatform, inputCode);

      testObj.externalAuth.tokenRequest.should.have.callCount(1);
      testObj.externalAuth.tokenRequest.should.have.calledWith(
        sinon.match
          .has('code', inputCode)
          .and(sinon.match.has('grantType', 'authorization_code'))
          .and(sinon.match.has('scope', sinon.match.array.deepEquals(['identify']))),
      );
      testObj.externalAuth.getUser.should.have.callCount(1);
      testObj.externalAuth.getUser.should.have.calledWith(sinon.match(outputTokenObj.access_token));
      expect(error).to.be.an.instanceof(ExternalAuthException);
      expect(error).to.have.property('errorInfo', userError);
    });

    test(`Should error verify auth user when add user in system`, async () => {
      const inputPlatform = 'discord';
      const inputCode = 'code';
      const outputTokenObj = {
        access_token: 'accessToken',
      };
      testObj.externalAuth.tokenRequest.resolves(outputTokenObj);
      const outputUserObj = {
        id: '123456789012',
        username: 'username',
        discriminator: '5645',
      };
      testObj.externalAuth.getUser.resolves(outputUserObj);
      testObj.userService.add.resolves([new UnknownException()]);

      const [error] = await testObj.discordExternalAuthService.verify(inputPlatform, inputCode);

      testObj.externalAuth.tokenRequest.should.have.callCount(1);
      testObj.externalAuth.tokenRequest.should.have.calledWith(
        sinon.match
          .has('code', inputCode)
          .and(sinon.match.has('grantType', 'authorization_code'))
          .and(sinon.match.has('scope', sinon.match.array.deepEquals(['identify']))),
      );
      testObj.externalAuth.getUser.should.have.callCount(1);
      testObj.externalAuth.getUser.should.have.calledWith(sinon.match(outputTokenObj.access_token));
      testObj.userService.add.should.have.callCount(1);
      testObj.userService.add.should.have.calledWith(
        sinon.match
          .instanceOf(UserModel)
          .and(sinon.match.has('username', outputUserObj.username))
          .and(sinon.match.has('username', outputUserObj.username))
          .and(sinon.match.has('role', 'user'))
          .and(sinon.match.hasNested('externalOauthData.discordId', outputUserObj.id))
          .and(sinon.match.hasNested('externalOauthData.discordTag', outputUserObj.discriminator)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully verify auth user when user not found in system`, async () => {
      const inputPlatform = 'discord';
      const inputCode = 'code';
      const outputTokenObj = {
        access_token: 'accessToken',
      };
      testObj.externalAuth.tokenRequest.resolves(outputTokenObj);
      const outputUserObj = {
        id: '123456789012',
        username: 'username',
        discriminator: '5645',
      };
      testObj.externalAuth.getUser.resolves(outputUserObj);
      const outputUserModel = new UserModel();
      outputUserModel.id = testObj.identifierGenerator.generateId();
      outputUserModel.username = 'username';
      testObj.userService.add.resolves([null, outputUserModel]);

      const [error, result] = await testObj.discordExternalAuthService.verify(
        inputPlatform,
        inputCode,
      );

      testObj.externalAuth.tokenRequest.should.have.callCount(1);
      testObj.externalAuth.tokenRequest.should.have.calledWith(
        sinon.match
          .has('code', inputCode)
          .and(sinon.match.has('grantType', 'authorization_code'))
          .and(sinon.match.has('scope', sinon.match.array.deepEquals(['identify']))),
      );
      testObj.externalAuth.getUser.should.have.callCount(1);
      testObj.externalAuth.getUser.should.have.calledWith(sinon.match(outputTokenObj.access_token));
      testObj.userService.add.should.have.callCount(1);
      testObj.userService.add.should.have.calledWith(
        sinon.match
          .instanceOf(UserModel)
          .and(sinon.match.has('username', outputUserObj.username))
          .and(sinon.match.has('password', sinon.match.string))
          .and(sinon.match.has('role', 'user'))
          .and(sinon.match.hasNested('externalOauthData.discordId', outputUserObj.id))
          .and(sinon.match.hasNested('externalOauthData.discordTag', outputUserObj.discriminator)),
      );
      expect(error).to.be.a('null');
      expect(result)
        .to.have.instanceOf(UserModel)
        .and.have.property('id', testObj.identifierGenerator.generateId());
    });

    test(`Should error verify auth user when user found in system and error in fetch user info`, async () => {
      const inputPlatform = 'discord';
      const inputCode = 'code';
      const outputTokenObj = {
        access_token: 'accessToken',
      };
      testObj.externalAuth.tokenRequest.resolves(outputTokenObj);
      const outputUserObj = {
        username: 'username',
        id: '123456789012',
        discriminator: '5645',
      };
      testObj.externalAuth.getUser.resolves(outputUserObj);
      testObj.userService.add.resolves([new UserExistException()]);
      testObj.userService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.discordExternalAuthService.verify(inputPlatform, inputCode);

      testObj.externalAuth.tokenRequest.should.have.callCount(1);
      testObj.externalAuth.tokenRequest.should.have.calledWith(
        sinon.match
          .has('code', inputCode)
          .and(sinon.match.has('grantType', 'authorization_code'))
          .and(sinon.match.has('scope', sinon.match.array.deepEquals(['identify']))),
      );
      testObj.externalAuth.getUser.should.have.callCount(1);
      testObj.externalAuth.getUser.should.have.calledWith(sinon.match(outputTokenObj.access_token));
      testObj.userService.add.should.have.callCount(1);
      testObj.userService.add.should.have.calledWith(
        sinon.match
          .instanceOf(UserModel)
          .and(sinon.match.has('username', outputUserObj.username))
          .and(sinon.match.has('password', sinon.match.string))
          .and(sinon.match.has('role', 'user'))
          .and(sinon.match.hasNested('externalOauthData.discordId', outputUserObj.id))
          .and(sinon.match.hasNested('externalOauthData.discordTag', outputUserObj.discriminator)),
      );
      testObj.userService.getAll.should.have.callCount(1);
      testObj.userService.getAll.should.have.calledWith(
        sinon.match.instanceOf(UserModel).and(sinon.match.has('username', outputUserObj.username)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully verify auth user when user found in system`, async () => {
      const inputPlatform = 'discord';
      const inputCode = 'code';
      const outputTokenObj = {
        access_token: 'accessToken',
      };
      testObj.externalAuth.tokenRequest.resolves(outputTokenObj);
      const outputUserObj = {
        id: '123456789012',
        username: 'username',
        discriminator: '5645',
      };
      testObj.externalAuth.getUser.resolves(outputUserObj);
      testObj.userService.add.resolves([new UserExistException()]);
      const outputUserModel = new UserModel();
      outputUserModel.id = testObj.identifierGenerator.generateId();
      outputUserModel.username = 'username';
      testObj.userService.getAll.resolves([null, [outputUserModel]]);

      const [error, result] = await testObj.discordExternalAuthService.verify(
        inputPlatform,
        inputCode,
      );

      testObj.externalAuth.tokenRequest.should.have.callCount(1);
      testObj.externalAuth.tokenRequest.should.have.calledWith(
        sinon.match
          .has('code', inputCode)
          .and(sinon.match.has('grantType', 'authorization_code'))
          .and(sinon.match.has('scope', sinon.match.array.deepEquals(['identify']))),
      );
      testObj.externalAuth.getUser.should.have.callCount(1);
      testObj.externalAuth.getUser.should.have.calledWith(sinon.match(outputTokenObj.access_token));
      testObj.userService.add.should.have.callCount(1);
      testObj.userService.add.should.have.calledWith(
        sinon.match
          .instanceOf(UserModel)
          .and(sinon.match.has('username', outputUserObj.username))
          .and(sinon.match.has('password', sinon.match.string))
          .and(sinon.match.has('role', 'user'))
          .and(sinon.match.hasNested('externalOauthData.discordId', outputUserObj.id))
          .and(sinon.match.hasNested('externalOauthData.discordTag', outputUserObj.discriminator)),
      );
      testObj.userService.getAll.should.have.callCount(1);
      testObj.userService.getAll.should.have.calledWith(
        sinon.match.instanceOf(UserModel).and(sinon.match.has('username', outputUserObj.username)),
      );
      expect(error).to.be.a('null');
      expect(result)
        .to.have.instanceOf(UserModel)
        .and.have.property('id', testObj.identifierGenerator.generateId());
    });
  });
});
