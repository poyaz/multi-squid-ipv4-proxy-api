/**
 * Created by pooya on 8/28/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const UserModel = require('~src/core/model/userModel');
const UrlAccessModel = require('~src/core/model/urlAccessModel');
const UnknownException = require('~src/core/exception/unknownException');
const NotFoundException = require('~src/core/exception/notFoundException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`UrlAccessService`, () => {
  setup(() => {
    const { userService, urlAccessRepository, urlAccessService } = helper.fakeUrlAccessService();

    testObj.userService = userService;
    testObj.urlAccessRepository = urlAccessRepository;
    testObj.urlAccessService = urlAccessService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
  });

  suite(`Add new url access`, () => {
    setup(() => {
      const inputModel = new UrlAccessModel();
      inputModel.username = 'user1';
      inputModel.urlList = [
        { url: 'google.com', isBlock: true },
        { url: 'www.google.com', isBlock: true },
      ];
      inputModel.startDate = new Date();
      inputModel.endDate = new Date(new Date().getTime() + 60000);

      const outputUserModel = new UserModel();
      outputUserModel.id = testObj.identifierGenerator.generateId();
      outputUserModel.username = 'test1';

      testObj.inputModel = inputModel;
      testObj.outputUserModel = outputUserModel;
    });

    test(`Should error add url access record when fetch user info`, async () => {
      const inputModel = testObj.inputModel;
      testObj.userService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.urlAccessService.add(inputModel);

      testObj.userService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error add url access record when user not found`, async () => {
      const inputModel = testObj.inputModel;
      testObj.userService.getAll.resolves([null, []]);

      const [error] = await testObj.urlAccessService.add(inputModel);

      testObj.userService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(NotFoundException);
      expect(error).to.have.property('httpCode', 404);
    });

    test(`Should error add url access record when add data`, async () => {
      const inputModel = testObj.inputModel;
      testObj.userService.getAll.resolves([null, [testObj.outputUserModel]]);
      testObj.urlAccessRepository.add.resolves([new UnknownException()]);

      const [error] = await testObj.urlAccessService.add(inputModel);

      testObj.userService.getAll.should.have.callCount(1);
      testObj.urlAccessRepository.add.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully add url access record`, async () => {
      const inputModel = testObj.inputModel;
      testObj.userService.getAll.resolves([null, [testObj.outputUserModel]]);
      const outputUrlModel = new UrlAccessModel();
      testObj.urlAccessRepository.add.resolves([null, outputUrlModel]);

      const [error, result] = await testObj.urlAccessService.add(inputModel);

      testObj.userService.getAll.should.have.callCount(1);
      testObj.urlAccessRepository.add.should.have.callCount(1);
      testObj.urlAccessRepository.add.should.have.calledWith(
        sinon.match
          .instanceOf(UrlAccessModel)
          .and(sinon.match.has('userId', testObj.identifierGenerator.generateId())),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceof(UrlAccessModel);
    });
  });
});
