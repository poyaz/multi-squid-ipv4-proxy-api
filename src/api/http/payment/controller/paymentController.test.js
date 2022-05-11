/**
 * Created by pooya on 5/11/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const { createRequest, createResponse } = require('node-mocks-http');

const helper = require('~src/helper');

const PaymentServiceModel = require('~src/core/model/paymentServiceModel');
const ExternalStoreModel = require('~src/core/model/externalStoreModel');
const UnknownException = require('~src/core/exception/unknownException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
chai.use(chaiAsPromised);

const expect = chai.expect;
const testObj = {};

suite(`PaymentController`, () => {
  setup(() => {
    testObj.req = new createRequest();
    testObj.res = new createResponse();

    const { paymentService, paymentController } = helper.fakePaymentController(
      testObj.req,
      testObj.res,
    );

    testObj.paymentService = paymentService;
    testObj.paymentController = paymentController;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.dateRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/;
    testObj.expireRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
  });

  suite(`Get all payment method`, () => {
    test(`Should error get all payment method`, async () => {
      testObj.paymentService.getAllPaymentMethod.resolves([new UnknownException()]);

      const [error] = await testObj.paymentController.getAllPaymentMethod();

      testObj.paymentService.getAllPaymentMethod.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully get all payment method`, async () => {
      const outputModel1 = new PaymentServiceModel();
      outputModel1.serviceName = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputModel1.mode = PaymentServiceModel.MODE_TEST;
      outputModel1.address = 'test.service.com';
      testObj.paymentService.getAllPaymentMethod.resolves([null, [outputModel1]]);

      const [error, result] = await testObj.paymentController.getAllPaymentMethod();

      testObj.paymentService.getAllPaymentMethod.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.a('object');
      expect(result[0]).to.have.include({
        serviceName: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        mode: PaymentServiceModel.MODE_TEST,
        address: 'test.service.com',
      });
    });
  });
});
