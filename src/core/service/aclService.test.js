/**
 * Created by pooya on 5/11/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const axios = require('axios');
const axiosGetStub = sinon.stub(axios, 'get');

const helper = require('~src/helper');

const OrderModel = require('~src/core/model/orderModel');
const PackageModel = require('~src/core/model/packageModel');
const ProductModel = require('~src/core/model/productModel');
const SubscriptionModel = require('~src/core/model/subscriptionModel');
const ExternalStoreModel = require('~src/core/model/externalStoreModel');
const UnknownException = require('~src/core/exception/unknownException');
const ForbiddenException = require('~src/core/exception/forbiddenException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`AclService`, () => {
  setup(() => {
    const { packageRepository, orderRepository, aclService } = helper.fakeAclService();

    testObj.packageRepository = packageRepository;
    testObj.orderRepository = orderRepository;
    testObj.aclService = aclService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
    testObj.userAccessAllow = helper.fakeIdentifierGenerator();
    testObj.userAccessDeny = helper.fakeIdentifierGenerator('id-1');
  });

  suite(`Is access to url`, () => {
    setup(() => {
      testObj.inputUserDataAllow = { id: testObj.userAccessAllow.generateId(), username: 'allow' };
      testObj.inputUserDataDeny = { id: testObj.userAccessDeny.generateId(), username: 'deny' };
    });

    suite(`Access to user`, () => {
      suite(`With userId`, () => {
        setup(() => {
          testObj.inputParams = { userId: testObj.identifierGenerator.generateId() };
        });

        test(`Should error access to package when user don't access to resource`, async () => {
          const inputUserData = testObj.inputUserDataDeny;
          const inputParams = testObj.inputParams;

          const [error] = await testObj.aclService.isAccessToUrl(inputUserData, inputParams);

          expect(error).to.be.an.instanceof(ForbiddenException);
          expect(error).to.have.property('httpCode', 403);
        });

        test(`Should successfully access to package when user access to resource`, async () => {
          const inputUserData = testObj.inputUserDataAllow;
          const inputParams = testObj.inputParams;

          const [error] = await testObj.aclService.isAccessToUrl(inputUserData, inputParams);

          expect(error).to.be.a('null');
        });
      });

      suite(`With username`, () => {
        setup(() => {
          testObj.inputParams = { username: 'allow' };
        });

        test(`Should error access to package when user don't access to resource`, async () => {
          const inputUserData = testObj.inputUserDataDeny;
          const inputParams = testObj.inputParams;

          const [error] = await testObj.aclService.isAccessToUrl(inputUserData, inputParams);

          expect(error).to.be.an.instanceof(ForbiddenException);
          expect(error).to.have.property('httpCode', 403);
        });

        test(`Should successfully access to package when user access to resource`, async () => {
          const inputUserData = testObj.inputUserDataAllow;
          const inputParams = testObj.inputParams;

          const [error] = await testObj.aclService.isAccessToUrl(inputUserData, inputParams);

          expect(error).to.be.a('null');
        });
      });
    });

    suite(`Access to package`, () => {
      setup(() => {
        testObj.inputParams = { packageId: testObj.identifierGenerator.generateId() };
      });

      test(`Should error access to package`, async () => {
        const inputUserData = {};
        const inputParams = testObj.inputParams;
        testObj.packageRepository.getById.resolves([new UnknownException()]);

        const [error] = await testObj.aclService.isAccessToUrl(inputUserData, inputParams);

        testObj.packageRepository.getById.should.have.callCount(1);
        expect(error).to.be.an.instanceof(UnknownException);
        expect(error).to.have.property('httpCode', 400);
      });

      test(`Should successfully access to package and return null when not found resource`, async () => {
        const inputUserData = testObj.inputUserDataDeny;
        const inputParams = testObj.inputParams;
        testObj.packageRepository.getById.resolves([null, null]);

        const [error] = await testObj.aclService.isAccessToUrl(inputUserData, inputParams);

        testObj.packageRepository.getById.should.have.callCount(1);
        expect(error).to.be.a('null');
      });

      test(`Should error access to package when user don't access to resource`, async () => {
        const inputUserData = testObj.inputUserDataDeny;
        const inputParams = testObj.inputParams;
        const outputModel = new PackageModel();
        outputModel.userId = testObj.identifierGenerator.generateId();
        testObj.packageRepository.getById.resolves([null, outputModel]);

        const [error] = await testObj.aclService.isAccessToUrl(inputUserData, inputParams);

        testObj.packageRepository.getById.should.have.callCount(1);
        expect(error).to.be.an.instanceof(ForbiddenException);
        expect(error).to.have.property('httpCode', 403);
      });

      test(`Should successfully access to package when user access to resource`, async () => {
        const inputUserData = testObj.inputUserDataAllow;
        const inputParams = testObj.inputParams;
        const outputModel = new PackageModel();
        outputModel.userId = testObj.identifierGenerator.generateId();
        testObj.packageRepository.getById.resolves([null, outputModel]);

        const [error] = await testObj.aclService.isAccessToUrl(inputUserData, inputParams);

        testObj.packageRepository.getById.should.have.callCount(1);
        expect(error).to.be.a('null');
      });
    });

    suite(`Access to order`, () => {
      setup(() => {
        testObj.inputParams = { orderId: testObj.identifierGenerator.generateId() };
      });

      test(`Should error access to order`, async () => {
        const inputUserData = {};
        const inputParams = testObj.inputParams;
        testObj.orderRepository.getById.resolves([new UnknownException()]);

        const [error] = await testObj.aclService.isAccessToUrl(inputUserData, inputParams);

        testObj.orderRepository.getById.should.have.callCount(1);
        expect(error).to.be.an.instanceof(UnknownException);
        expect(error).to.have.property('httpCode', 400);
      });

      test(`Should successfully access to order and return null when not found resource`, async () => {
        const inputUserData = testObj.inputUserDataDeny;
        const inputParams = testObj.inputParams;
        testObj.orderRepository.getById.resolves([null, null]);

        const [error] = await testObj.aclService.isAccessToUrl(inputUserData, inputParams);

        testObj.orderRepository.getById.should.have.callCount(1);
        expect(error).to.be.a('null');
      });

      test(`Should error access to order when user don't access to resource`, async () => {
        const inputUserData = testObj.inputUserDataDeny;
        const inputParams = testObj.inputParams;
        const outputModel = new PackageModel();
        outputModel.userId = testObj.identifierGenerator.generateId();
        testObj.orderRepository.getById.resolves([null, outputModel]);

        const [error] = await testObj.aclService.isAccessToUrl(inputUserData, inputParams);

        testObj.orderRepository.getById.should.have.callCount(1);
        expect(error).to.be.an.instanceof(ForbiddenException);
        expect(error).to.have.property('httpCode', 403);
      });

      test(`Should successfully access to order when user access to resource`, async () => {
        const inputUserData = testObj.inputUserDataAllow;
        const inputParams = testObj.inputParams;
        const outputModel = new PackageModel();
        outputModel.userId = testObj.identifierGenerator.generateId();
        testObj.orderRepository.getById.resolves([null, outputModel]);

        const [error] = await testObj.aclService.isAccessToUrl(inputUserData, inputParams);

        testObj.orderRepository.getById.should.have.callCount(1);
        expect(error).to.be.a('null');
      });
    });
  });
});
