/**
 * Created by pooya on 8/23/21.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const UserModel = require('~src/core/model/userModel');
const UserExistException = require('~src/core/exception/userExistException');
const UnknownException = require('~src/core/exception/unknownException');
const NotFoundException = require('~src/core/exception/notFoundException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`UserService`, () => {
  setup(() => {
    const { userRepository, userSquidRepository, userService } = helper.fakeUserService();

    testObj.userRepository = userRepository;
    testObj.userSquidRepository = userSquidRepository;
    testObj.userService = userService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
  });

  suite(`Get all users`, () => {
    test(`Should error get all users`, async () => {
      const filterInput = new UserModel();
      testObj.userRepository.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.userService.getAll(filterInput);

      testObj.userRepository.getAll.should.have.callCount(1);
      testObj.userRepository.getAll.should.have.calledWith(sinon.match.instanceOf(UserModel));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully get all users with empty array`, async () => {
      const filterInput = new UserModel();
      testObj.userRepository.getAll.resolves([null, []]);

      const [error, result] = await testObj.userService.getAll(filterInput);

      testObj.userRepository.getAll.should.have.callCount(1);
      testObj.userRepository.getAll.should.have.calledWith(sinon.match.instanceOf(UserModel));
      expect(error).to.be.a('null');
      expect(result).to.have.length(0);
    });

    test(`Should successfully get all users with record`, async () => {
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
      testObj.userRepository.getAll.resolves([null, [outputModel1, outputModel2]]);

      const [error, result] = await testObj.userService.getAll();

      testObj.userRepository.getAll.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.length(2);
      expect(result[0]).to.have.instanceOf(UserModel);
      expect(result[1]).to.have.instanceOf(UserModel);
    });
  });

  suite(`Add user`, () => {
    test(`Should error add new user when check user exist in database`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'username';
      inputModel.password = 'password';
      testObj.userRepository.isUserExist.resolves([new UnknownException()]);

      const [error] = await testObj.userService.add(inputModel);

      testObj.userRepository.isUserExist.should.have.callCount(1);
      testObj.userRepository.isUserExist.should.have.calledWith(sinon.match(inputModel.username));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error add new user when check user exist in proxy`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'username';
      inputModel.password = 'password';
      testObj.userRepository.isUserExist.resolves([null, false]);
      testObj.userSquidRepository.isUserExist.resolves([new UnknownException()]);

      const [error] = await testObj.userService.add(inputModel);

      testObj.userRepository.isUserExist.should.have.callCount(1);
      testObj.userRepository.isUserExist.should.have.calledWith(sinon.match(inputModel.username));
      testObj.userSquidRepository.isUserExist.should.have.callCount(1);
      testObj.userSquidRepository.isUserExist.should.have.calledWith(
        sinon.match(inputModel.username),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error add new user if user exist in system`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'username';
      inputModel.password = 'password';
      testObj.userRepository.isUserExist.resolves([null, true]);
      testObj.userSquidRepository.isUserExist.resolves([null, true]);

      const [error] = await testObj.userService.add(inputModel);

      testObj.userRepository.isUserExist.should.have.callCount(1);
      testObj.userRepository.isUserExist.should.have.calledWith(sinon.match(inputModel.username));
      testObj.userSquidRepository.isUserExist.should.have.callCount(1);
      testObj.userSquidRepository.isUserExist.should.have.calledWith(
        sinon.match(inputModel.username),
      );
      expect(error).to.be.an.instanceof(UserExistException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error add new user if user can't create in database`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'username';
      inputModel.password = 'password';
      testObj.userRepository.isUserExist.resolves([null, false]);
      testObj.userSquidRepository.isUserExist.resolves([null, false]);
      testObj.userRepository.add.resolves([new UnknownException()]);

      const [error] = await testObj.userService.add(inputModel);

      testObj.userRepository.isUserExist.should.have.callCount(1);
      testObj.userRepository.isUserExist.should.have.calledWith(sinon.match(inputModel.username));
      testObj.userSquidRepository.isUserExist.should.have.callCount(1);
      testObj.userSquidRepository.isUserExist.should.have.calledWith(
        sinon.match(inputModel.username),
      );
      testObj.userRepository.add.should.have.callCount(1);
      testObj.userRepository.add.should.have.calledWith(sinon.match.instanceOf(UserModel));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error add new user if user can't create in porxy`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'username';
      inputModel.password = 'password';
      const outputModel = new UserModel();
      testObj.userRepository.isUserExist.resolves([null, false]);
      testObj.userSquidRepository.isUserExist.resolves([null, false]);
      testObj.userRepository.add.resolves([null, outputModel]);
      testObj.userSquidRepository.add.resolves([new UnknownException()]);

      const [error] = await testObj.userService.add(inputModel);

      testObj.userRepository.isUserExist.should.have.callCount(1);
      testObj.userRepository.isUserExist.should.have.calledWith(sinon.match(inputModel.username));
      testObj.userSquidRepository.isUserExist.should.have.callCount(1);
      testObj.userSquidRepository.isUserExist.should.have.calledWith(
        sinon.match(inputModel.username),
      );
      testObj.userRepository.add.should.have.callCount(1);
      testObj.userRepository.add.should.have.calledWith(sinon.match.instanceOf(UserModel));
      testObj.userSquidRepository.add.should.have.callCount(1);
      testObj.userSquidRepository.add.should.have.calledWith(sinon.match.instanceOf(UserModel));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully add new user`, async () => {
      const inputModel = new UserModel();
      inputModel.username = 'username';
      inputModel.password = 'password';
      const outputModel = new UserModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      testObj.userRepository.isUserExist.resolves([null, false]);
      testObj.userSquidRepository.isUserExist.resolves([null, false]);
      testObj.userRepository.add.resolves([null, outputModel]);
      testObj.userSquidRepository.add.resolves([null]);

      const [error, result] = await testObj.userService.add(inputModel);

      testObj.userRepository.isUserExist.should.have.callCount(1);
      testObj.userRepository.isUserExist.should.have.calledWith(sinon.match(inputModel.username));
      testObj.userSquidRepository.isUserExist.should.have.callCount(1);
      testObj.userSquidRepository.isUserExist.should.have.calledWith(
        sinon.match(inputModel.username),
      );
      testObj.userRepository.add.should.have.callCount(1);
      testObj.userRepository.add.should.have.calledWith(sinon.match.instanceOf(UserModel));
      testObj.userSquidRepository.add.should.have.callCount(1);
      testObj.userSquidRepository.add.should.have.calledWith(sinon.match.instanceOf(UserModel));
      expect(error).to.be.a('null');
      expect(result)
        .to.have.instanceOf(UserModel)
        .and.have.property('id', testObj.identifierGenerator.generateId());
    });
  });

  suite(`Change password`, () => {
    test(`Should error change password when fetch user`, async () => {
      const inputUsername = 'user1';
      const inputPassword = 'password';
      testObj.userRepository.isUserExist.resolves([new UnknownException()]);

      const [error] = await testObj.userService.changePassword(inputUsername, inputPassword);

      testObj.userRepository.isUserExist.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error change password when user not found`, async () => {
      const inputUsername = 'user1';
      const inputPassword = 'password';
      testObj.userRepository.isUserExist.resolves([null, false]);

      const [error] = await testObj.userService.changePassword(inputUsername, inputPassword);

      testObj.userRepository.isUserExist.should.have.callCount(1);
      expect(error).to.be.an.instanceof(NotFoundException);
      expect(error).to.have.property('httpCode', 404);
    });

    test(`Should error change password when update password`, async () => {
      const inputUsername = 'user1';
      const inputPassword = 'password';
      testObj.userRepository.isUserExist.resolves([null, true]);
      testObj.userSquidRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.userService.changePassword(inputUsername, inputPassword);

      testObj.userRepository.isUserExist.should.have.callCount(1);
      testObj.userSquidRepository.update.should.have.callCount(1);
      testObj.userSquidRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(UserModel)
          .and(sinon.match.has('username', inputUsername))
          .and(sinon.match.has('password', inputPassword)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully change password`, async () => {
      const inputUsername = 'user1';
      const inputPassword = 'password';
      testObj.userRepository.isUserExist.resolves([null, true]);
      testObj.userSquidRepository.update.resolves([null]);

      const [error] = await testObj.userService.changePassword(inputUsername, inputPassword);

      testObj.userRepository.isUserExist.should.have.callCount(1);
      testObj.userSquidRepository.update.should.have.callCount(1);
      testObj.userSquidRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(UserModel)
          .and(sinon.match.has('username', inputUsername))
          .and(sinon.match.has('password', inputPassword)),
      );
      expect(error).to.be.a('null');
    });
  });

  suite(`Disable user by username`, () => {
    test(`Should error disable user by username when fetch user info`, async () => {
      const inputUsername = 'user1';
      testObj.userRepository.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.userService.disableByUsername(inputUsername);

      testObj.userRepository.getAll.should.have.callCount(1);
      testObj.userRepository.getAll.should.have.calledWith(sinon.match.has('username', 'user1'));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error disable user by username when user not found`, async () => {
      const inputUsername = 'user1';
      testObj.userRepository.getAll.resolves([null, []]);

      const [error] = await testObj.userService.disableByUsername(inputUsername);

      testObj.userRepository.getAll.should.have.callCount(1);
      testObj.userRepository.getAll.should.have.calledWith(sinon.match.has('username', 'user1'));
      expect(error).to.be.an.instanceof(NotFoundException);
      expect(error).to.have.property('httpCode', 404);
    });

    test(`Should error disable user by username when update user`, async () => {
      const inputUsername = 'user1';
      const outputModel = new UserModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.username = 'user1';
      testObj.userRepository.getAll.resolves([null, [outputModel]]);
      testObj.userRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.userService.disableByUsername(inputUsername);

      testObj.userRepository.getAll.should.have.callCount(1);
      testObj.userRepository.getAll.should.have.calledWith(sinon.match.has('username', 'user1'));
      testObj.userRepository.update.should.have.callCount(1);
      testObj.userRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.identifierGenerator.generateId())
          .and(sinon.match.has('isEnable', false)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully disable user by username`, async () => {
      const inputUsername = 'user1';
      const outputModel = new UserModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.username = 'user1';
      testObj.userRepository.getAll.resolves([null, [outputModel]]);
      testObj.userRepository.update.resolves([null]);

      const [error] = await testObj.userService.disableByUsername(inputUsername);

      testObj.userRepository.getAll.should.have.callCount(1);
      testObj.userRepository.getAll.should.have.calledWith(sinon.match.has('username', 'user1'));
      testObj.userRepository.update.should.have.callCount(1);
      testObj.userRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.identifierGenerator.generateId())
          .and(sinon.match.has('isEnable', false)),
      );
      expect(error).to.be.a('null');
    });
  });

  suite(`enable user by username`, () => {
    test(`Should error enable user by username when fetch user info`, async () => {
      const inputUsername = 'user1';
      testObj.userRepository.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.userService.enableByUsername(inputUsername);

      testObj.userRepository.getAll.should.have.callCount(1);
      testObj.userRepository.getAll.should.have.calledWith(sinon.match.has('username', 'user1'));
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should error enable user by username when user not found`, async () => {
      const inputUsername = 'user1';
      testObj.userRepository.getAll.resolves([null, []]);

      const [error] = await testObj.userService.enableByUsername(inputUsername);

      testObj.userRepository.getAll.should.have.callCount(1);
      testObj.userRepository.getAll.should.have.calledWith(sinon.match.has('username', 'user1'));
      expect(error).to.be.an.instanceof(NotFoundException);
      expect(error).to.have.property('httpCode', 404);
    });

    test(`Should error enable user by username when update user`, async () => {
      const inputUsername = 'user1';
      const outputModel = new UserModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.username = 'user1';
      testObj.userRepository.getAll.resolves([null, [outputModel]]);
      testObj.userRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.userService.enableByUsername(inputUsername);

      testObj.userRepository.getAll.should.have.callCount(1);
      testObj.userRepository.getAll.should.have.calledWith(sinon.match.has('username', 'user1'));
      testObj.userRepository.update.should.have.callCount(1);
      testObj.userRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.identifierGenerator.generateId())
          .and(sinon.match.has('isEnable', true)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully enable user by username`, async () => {
      const inputUsername = 'user1';
      const outputModel = new UserModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.username = 'user1';
      testObj.userRepository.getAll.resolves([null, [outputModel]]);
      testObj.userRepository.update.resolves([null]);

      const [error] = await testObj.userService.enableByUsername(inputUsername);

      testObj.userRepository.getAll.should.have.callCount(1);
      testObj.userRepository.getAll.should.have.calledWith(sinon.match.has('username', 'user1'));
      testObj.userRepository.update.should.have.callCount(1);
      testObj.userRepository.update.should.have.calledWith(
        sinon.match
          .has('id', testObj.identifierGenerator.generateId())
          .and(sinon.match.has('isEnable', true)),
      );
      expect(error).to.be.a('null');
    });
  });
});
