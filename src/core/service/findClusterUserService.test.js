/**
 * Created by pooya on 2/21/22.
 */

/**
 * Created by pooya on 8/23/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const UserModel = require('~src/core/model/userModel');
const PackageModel = require('~src/core/model/packageModel');
const UserExistException = require('~src/core/exception/userExistException');
const UnknownException = require('~src/core/exception/unknownException');
const NotFoundException = require('~src/core/exception/notFoundException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`FindClusterUserService`, () => {
  setup(() => {
    const {
      userService,
      serverService,
      serverApiRepository,
      findClusterUserService,
    } = helper.fakeFindClusterUserService();

    testObj.userService = userService;
    testObj.serverService = serverService;
    testObj.serverApiRepository = serverApiRepository;
    testObj.findClusterUserService = findClusterUserService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
  });

  suite(`Get all users`, () => {
    test(`Should error get all users`, async () => {
      const filterInput = new UserModel();
      testObj.userService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.findClusterUserService.getAll(filterInput);

      testObj.userService.getAll.should.have.callCount(1);
      testObj.userService.getAll.should.have.calledWith(sinon.match.instanceOf(UserModel));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully get all users`, async () => {
      const filterInput = new UserModel();
      const outputModel1 = new UserModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.username = 'user1';
      outputModel1.isEnable = true;
      outputModel1.insertDate = new Date();
      const outputModel2 = new UserModel();
      outputModel2.id = testObj.identifierGenerator.generateId();
      outputModel2.username = 'user1';
      outputModel2.isEnable = true;
      outputModel2.insertDate = new Date();
      testObj.userService.getAll.resolves([null, [outputModel1, outputModel2]]);

      const [error, result] = await testObj.findClusterUserService.getAll(filterInput);

      testObj.userService.getAll.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.length(2);
      expect(result[0]).to.have.instanceOf(UserModel);
      expect(result[1]).to.have.instanceOf(UserModel);
    });
  });
});
