/**
 * Created by pooya on 5/8/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const ProductModel = require('~src/core/model/productModel');
const ExternalStoreModel = require('~src/core/model/externalStoreModel');
const UnknownException = require('~src/core/exception/unknownException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

/**
 * @property eventually
 * @property rejectedWith
 */
const expect = chai.expect;
const testObj = {};

suite(`ExternalProductApiRepository`, () => {
  setup(() => {
    const {
      productRepository,
      fastspringApiRepository,
      externalProductApiRepository,
    } = helper.fakeExternalProductApiRepository();

    testObj.productRepository = productRepository;
    testObj.fastspringApiRepository = fastspringApiRepository;
    testObj.externalProductApiRepository = externalProductApiRepository;

    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
    testObj.identifierGenerator1 = helper.fakeIdentifierGenerator('id-1');
    testObj.identifierGenerator2 = helper.fakeIdentifierGenerator('id-2');
    testObj.identifierGenerator3 = helper.fakeIdentifierGenerator('id-3');
    testObj.consoleError = sinon.stub(console, 'error');
  });

  teardown(() => {
    testObj.consoleError.restore();
  });

  suite(`Get all product`, () => {
    setup(() => {
      const outputModel1 = new ProductModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.count = 10;
      outputModel1.price = 3000;
      outputModel1.expireDay = 60;
      const externalStoreModel1 = new ExternalStoreModel();
      externalStoreModel1.id = testObj.identifierGenerator1.generateId();
      externalStoreModel1.productId = testObj.identifierGenerator.generateId();
      externalStoreModel1.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      externalStoreModel1.serial = 'product serial 1';
      externalStoreModel1.price.push({ value: 3000, unit: 'USD', country: 'US' });
      outputModel1.externalStore.push(externalStoreModel1);
      outputModel1.isEnable = true;
      outputModel1.insertDate = new Date();

      const outputModel2 = new ProductModel();
      outputModel2.id = testObj.identifierGenerator2.generateId();
      outputModel2.count = 3;
      outputModel2.price = 1000;
      const externalStoreModel2 = new ExternalStoreModel();
      externalStoreModel2.id = testObj.identifierGenerator3.generateId();
      externalStoreModel2.productId = testObj.identifierGenerator2.generateId();
      externalStoreModel2.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      externalStoreModel2.serial = 'product serial 2';
      externalStoreModel2.price.push({ value: 1000, unit: 'USD', country: 'US' });
      outputModel2.externalStore.push(externalStoreModel2);
      outputModel2.expireDay = 60;
      outputModel2.isEnable = true;
      outputModel2.insertDate = new Date();

      testObj.outputModel1 = outputModel1;
      testObj.outputModel2 = outputModel2;
    });

    test(`Should error get all product`, async () => {
      const inputFilter = new ProductModel();
      testObj.productRepository.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.externalProductApiRepository.getAll(inputFilter);

      testObj.productRepository.getAll.should.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully get all product without get price for each product (if price has been set)`, async () => {
      const inputFilter = new ProductModel();
      const outputModel1 = testObj.outputModel1;
      const outputModel2 = testObj.outputModel2;
      testObj.productRepository.getAll.resolves([null, [outputModel1, outputModel2]]);

      const [error, result] = await testObj.externalProductApiRepository.getAll(inputFilter);

      expect(error).to.be.a('null');
      expect(result).to.be.length(2);
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result[0].externalStore[0]).to.have.include({
        id: testObj.identifierGenerator1.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial 1',
      });
      expect(result[0].externalStore[0].price[0]).to.have.include({
        value: 3000,
        unit: 'USD',
        country: 'US',
      });
      expect(result[1]).to.have.include({
        id: testObj.identifierGenerator2.generateId(),
        count: 3,
        price: 1000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result[1].externalStore[0]).to.have.include({
        id: testObj.identifierGenerator3.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial 2',
      });
      expect(result[1].externalStore[0].price[0]).to.have.include({
        value: 1000,
        unit: 'USD',
        country: 'US',
      });
    });

    test(`Should successfully get all product (has error when get price for each product)`, async () => {
      const inputFilter = new ProductModel();
      const outputModel1 = testObj.outputModel1;
      outputModel1.externalStore[0].price = [];
      const outputModel2 = testObj.outputModel2;
      outputModel2.externalStore[0].price = [];
      testObj.productRepository.getAll.resolves([null, [outputModel1, outputModel2]]);
      testObj.fastspringApiRepository.getProductPrice.resolves([new UnknownException()]);

      const [error, result] = await testObj.externalProductApiRepository.getAll(inputFilter);

      testObj.productRepository.getAll.should.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.callCount(2);
      testObj.fastspringApiRepository.getProductPrice
        .getCall(0)
        .should.have.calledWith(sinon.match('product serial 1'));
      testObj.fastspringApiRepository.getProductPrice
        .getCall(1)
        .should.have.calledWith(sinon.match('product serial 2'));
      testObj.consoleError.should.have.callCount(2);
      expect(error).to.be.a('null');
      expect(result).to.be.length(2);
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result[0].externalStore[0]).to.have.include({
        id: testObj.identifierGenerator1.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial 1',
      });
      expect(result[0].externalStore[0].price).to.be.length(0);
      expect(result[1]).to.have.include({
        id: testObj.identifierGenerator2.generateId(),
        count: 3,
        price: 1000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result[1].externalStore[0]).to.have.include({
        id: testObj.identifierGenerator3.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial 2',
      });
      expect(result[1].externalStore[0].price).to.be.length(0);
    });

    test(`Should successfully get all product (fill price of each product)`, async () => {
      const inputFilter = new ProductModel();
      const outputModel1 = testObj.outputModel1;
      outputModel1.externalStore[0].price = [];
      const outputModel2 = testObj.outputModel2;
      outputModel2.externalStore[0].price = [];
      testObj.productRepository.getAll.resolves([null, [outputModel1, outputModel2]]);
      const outputExternalModel1 = new ExternalStoreModel();
      outputExternalModel1.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputExternalModel1.serial = 'product serial 1';
      outputExternalModel1.price = [{ unit: 'USD', value: 6000, country: 'US' }];
      const outputExternalModel2 = new ExternalStoreModel();
      outputExternalModel2.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputExternalModel2.serial = 'product serial 2';
      outputExternalModel2.price = [{ unit: 'USD', value: 3000, country: 'US' }];
      testObj.fastspringApiRepository.getProductPrice
        .onCall(0)
        .resolves([null, outputExternalModel1])
        .onCall(1)
        .resolves([null, outputExternalModel2]);

      const [error, result] = await testObj.externalProductApiRepository.getAll(inputFilter);

      testObj.productRepository.getAll.should.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.callCount(2);
      testObj.fastspringApiRepository.getProductPrice
        .getCall(0)
        .should.have.calledWith(sinon.match('product serial 1'));
      testObj.fastspringApiRepository.getProductPrice
        .getCall(1)
        .should.have.calledWith(sinon.match('product serial 2'));
      testObj.consoleError.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.length(2);
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result[0].externalStore[0]).to.have.include({
        id: testObj.identifierGenerator1.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial 1',
      });
      expect(result[0].externalStore[0].price[0]).to.have.include({
        value: 6000,
        unit: 'USD',
        country: 'US',
      });
      expect(result[1]).to.have.include({
        id: testObj.identifierGenerator2.generateId(),
        count: 3,
        price: 1000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result[1].externalStore[0]).to.have.include({
        id: testObj.identifierGenerator3.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial 2',
      });
      expect(result[1].externalStore[0].price[0]).to.have.include({
        value: 3000,
        unit: 'USD',
        country: 'US',
      });
    });

    test(`Should successfully get all product (has error when upsert price for each product on background)`, async () => {
      const inputFilter = new ProductModel();
      const outputModel1 = testObj.outputModel1;
      outputModel1.externalStore[0].price = [];
      const outputModel2 = testObj.outputModel2;
      outputModel2.externalStore[0].price = [];
      testObj.productRepository.getAll.resolves([null, [outputModel1, outputModel2]]);
      const outputExternalModel1 = new ExternalStoreModel();
      outputExternalModel1.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputExternalModel1.serial = 'product serial 1';
      outputExternalModel1.price = [{ unit: 'USD', value: 6000, country: 'US' }];
      const outputExternalModel2 = new ExternalStoreModel();
      outputExternalModel2.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputExternalModel2.serial = 'product serial 2';
      outputExternalModel2.price = [{ unit: 'USD', value: 3000, country: 'US' }];
      testObj.fastspringApiRepository.getProductPrice
        .onCall(0)
        .resolves([null, outputExternalModel1])
        .onCall(1)
        .resolves([null, outputExternalModel2]);
      testObj.productRepository.upsertExternalProductPrice.resolves([new UnknownException()]);

      const [error, result] = await testObj.externalProductApiRepository.getAll(inputFilter);

      testObj.productRepository.getAll.should.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.callCount(2);
      testObj.fastspringApiRepository.getProductPrice
        .getCall(0)
        .should.have.calledWith(sinon.match('product serial 1'));
      testObj.fastspringApiRepository.getProductPrice
        .getCall(1)
        .should.have.calledWith(sinon.match('product serial 2'));
      testObj.productRepository.upsertExternalProductPrice.should.have.callCount(2);
      testObj.productRepository.upsertExternalProductPrice
        .getCall(0)
        .should.have.calledWith(sinon.match.has('id', testObj.identifierGenerator1.generateId()));
      testObj.productRepository.upsertExternalProductPrice
        .getCall(1)
        .should.have.calledWith(sinon.match.has('id', testObj.identifierGenerator3.generateId()));
      await helper.sleep(10);
      testObj.consoleError.should.have.callCount(2);
      expect(error).to.be.a('null');
      expect(result).to.be.length(2);
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result[0].externalStore[0]).to.have.include({
        id: testObj.identifierGenerator1.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial 1',
      });
      expect(result[0].externalStore[0].price[0]).to.have.include({
        value: 6000,
        unit: 'USD',
        country: 'US',
      });
      expect(result[1]).to.have.include({
        id: testObj.identifierGenerator2.generateId(),
        count: 3,
        price: 1000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result[1].externalStore[0]).to.have.include({
        id: testObj.identifierGenerator3.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial 2',
      });
      expect(result[1].externalStore[0].price[0]).to.have.include({
        value: 3000,
        unit: 'USD',
        country: 'US',
      });
    });

    test(`Should successfully get all product (has successfully upsert price for each product on background)`, async () => {
      const inputFilter = new ProductModel();
      const outputModel1 = testObj.outputModel1;
      outputModel1.externalStore[0].price = [];
      const outputModel2 = testObj.outputModel2;
      outputModel2.externalStore[0].price = [];
      testObj.productRepository.getAll.resolves([null, [outputModel1, outputModel2]]);
      const outputExternalModel1 = new ExternalStoreModel();
      outputExternalModel1.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputExternalModel1.serial = 'product serial 1';
      outputExternalModel1.price = [{ unit: 'USD', value: 6000, country: 'US' }];
      const outputExternalModel2 = new ExternalStoreModel();
      outputExternalModel2.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputExternalModel2.serial = 'product serial 2';
      outputExternalModel2.price = [{ unit: 'USD', value: 3000, country: 'US' }];
      testObj.fastspringApiRepository.getProductPrice
        .onCall(0)
        .resolves([null, outputExternalModel1])
        .onCall(1)
        .resolves([null, outputExternalModel2]);
      testObj.productRepository.upsertExternalProductPrice.resolves([null]);

      const [error, result] = await testObj.externalProductApiRepository.getAll(inputFilter);

      testObj.productRepository.getAll.should.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.callCount(2);
      testObj.fastspringApiRepository.getProductPrice
        .getCall(0)
        .should.have.calledWith(sinon.match('product serial 1'));
      testObj.fastspringApiRepository.getProductPrice
        .getCall(1)
        .should.have.calledWith(sinon.match('product serial 2'));
      testObj.productRepository.upsertExternalProductPrice.should.have.callCount(2);
      testObj.productRepository.upsertExternalProductPrice
        .getCall(0)
        .should.have.calledWith(sinon.match.has('id', testObj.identifierGenerator1.generateId()));
      testObj.productRepository.upsertExternalProductPrice
        .getCall(1)
        .should.have.calledWith(sinon.match.has('id', testObj.identifierGenerator3.generateId()));
      await helper.sleep(10);
      testObj.consoleError.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.length(2);
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result[0].externalStore[0]).to.have.include({
        id: testObj.identifierGenerator1.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial 1',
      });
      expect(result[0].externalStore[0].price[0]).to.have.include({
        value: 6000,
        unit: 'USD',
        country: 'US',
      });
      expect(result[1]).to.have.include({
        id: testObj.identifierGenerator2.generateId(),
        count: 3,
        price: 1000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result[1].externalStore[0]).to.have.include({
        id: testObj.identifierGenerator3.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial 2',
      });
      expect(result[1].externalStore[0].price[0]).to.have.include({
        value: 3000,
        unit: 'USD',
        country: 'US',
      });
    });
  });

  suite(`Get by product by id`, () => {
    setup(() => {
      const outputModel = new ProductModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.count = 10;
      outputModel.price = 3000;
      outputModel.expireDay = 60;
      const externalStoreModel1 = new ExternalStoreModel();
      externalStoreModel1.id = testObj.identifierGenerator1.generateId();
      externalStoreModel1.productId = testObj.identifierGenerator.generateId();
      externalStoreModel1.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      externalStoreModel1.serial = 'product serial';
      externalStoreModel1.price.push({ value: 3000, unit: 'USD', country: 'US' });
      outputModel.externalStore.push(externalStoreModel1);
      outputModel.isEnable = true;
      outputModel.insertDate = new Date();

      testObj.outputModel = outputModel;
    });

    test(`Should error get product by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.productRepository.getById.resolves([new UnknownException()]);

      const [error] = await testObj.externalProductApiRepository.getById(inputId);

      testObj.productRepository.getById.should.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully get product by id without get price of product (if price has been set)`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputModel = testObj.outputModel;
      testObj.productRepository.getById.resolves([null, outputModel]);

      const [error, result] = await testObj.externalProductApiRepository.getById(inputId);

      testObj.productRepository.getById.should.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result.externalStore[0]).to.have.include({
        id: testObj.identifierGenerator1.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial',
      });
      expect(result.externalStore[0].price[0]).to.have.include({
        value: 3000,
        unit: 'USD',
        country: 'US',
      });
    });

    test(`Should successfully get product by id (has error when get price of product)`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputModel = testObj.outputModel;
      outputModel.externalStore[0].price = [];
      testObj.productRepository.getById.resolves([null, outputModel]);
      testObj.fastspringApiRepository.getProductPrice.resolves([new UnknownException()]);

      const [error, result] = await testObj.externalProductApiRepository.getById(inputId);

      testObj.productRepository.getById.should.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.calledWith(
        sinon.match('product serial'),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result.externalStore[0]).to.have.include({
        id: testObj.identifierGenerator1.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial',
      });
      expect(result.externalStore[0].price).to.be.length(0);
    });

    test(`Should successfully get product by id (fill price of product)`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputModel = testObj.outputModel;
      outputModel.externalStore[0].price = [];
      testObj.productRepository.getById.resolves([null, outputModel]);
      const outputExternalModel = new ExternalStoreModel();
      outputExternalModel.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputExternalModel.serial = 'product serial';
      outputExternalModel.price = [{ unit: 'USD', value: 6000, country: 'US' }];
      testObj.fastspringApiRepository.getProductPrice.resolves([null, outputExternalModel]);

      const [error, result] = await testObj.externalProductApiRepository.getById(inputId);

      testObj.productRepository.getById.should.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.calledWith(
        sinon.match('product serial'),
      );
      testObj.consoleError.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result.externalStore[0]).to.have.include({
        id: testObj.identifierGenerator1.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial',
      });
      expect(result.externalStore[0].price[0]).to.have.include({
        value: 6000,
        unit: 'USD',
        country: 'US',
      });
    });

    test(`Should successfully get product by id (has error when upsert price of product on background)`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputModel = testObj.outputModel;
      outputModel.externalStore[0].price = [];
      testObj.productRepository.getById.resolves([null, outputModel]);
      const outputExternalModel = new ExternalStoreModel();
      outputExternalModel.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputExternalModel.serial = 'product serial';
      outputExternalModel.price = [{ unit: 'USD', value: 6000, country: 'US' }];
      testObj.fastspringApiRepository.getProductPrice.resolves([null, outputExternalModel]);
      testObj.productRepository.upsertExternalProductPrice.resolves([new UnknownException()]);

      const [error, result] = await testObj.externalProductApiRepository.getById(inputId);

      testObj.productRepository.getById.should.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.calledWith(
        sinon.match('product serial'),
      );
      testObj.productRepository.upsertExternalProductPrice.should.have.callCount(1);
      testObj.productRepository.upsertExternalProductPrice.should.have.calledWith(
        sinon.match.has('id', testObj.identifierGenerator1.generateId()),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result.externalStore[0]).to.have.include({
        id: testObj.identifierGenerator1.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial',
      });
      expect(result.externalStore[0].price[0]).to.have.include({
        value: 6000,
        unit: 'USD',
        country: 'US',
      });
    });

    test(`Should successfully get product by id (has successfully upsert price of product on background)`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputModel = testObj.outputModel;
      outputModel.externalStore[0].price = [];
      testObj.productRepository.getById.resolves([null, outputModel]);
      const outputExternalModel = new ExternalStoreModel();
      outputExternalModel.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputExternalModel.serial = 'product serial';
      outputExternalModel.price = [{ unit: 'USD', value: 6000, country: 'US' }];
      testObj.fastspringApiRepository.getProductPrice.resolves([null, outputExternalModel]);
      testObj.productRepository.upsertExternalProductPrice.resolves([null]);

      const [error, result] = await testObj.externalProductApiRepository.getById(inputId);

      testObj.productRepository.getById.should.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.calledWith(
        sinon.match('product serial'),
      );
      testObj.productRepository.upsertExternalProductPrice.should.have.callCount(1);
      testObj.productRepository.upsertExternalProductPrice.should.have.calledWith(
        sinon.match.has('id', testObj.identifierGenerator1.generateId()),
      );
      testObj.consoleError.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result.externalStore[0]).to.have.include({
        id: testObj.identifierGenerator1.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial',
      });
      expect(result.externalStore[0].price[0]).to.have.include({
        value: 6000,
        unit: 'USD',
        country: 'US',
      });
    });
  });

  suite(`Add product`, () => {
    setup(() => {
      const inputModel = new ProductModel();
      inputModel.count = 10;
      inputModel.price = 3000;
      inputModel.expireDay = 60;
      inputModel.isEnable = true;

      const outputModel = new ProductModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.count = 10;
      outputModel.price = 3000;
      outputModel.expireDay = 60;
      const externalStoreModel1 = new ExternalStoreModel();
      externalStoreModel1.id = testObj.identifierGenerator1.generateId();
      externalStoreModel1.productId = testObj.identifierGenerator.generateId();
      externalStoreModel1.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      externalStoreModel1.serial = 'product serial';
      outputModel.externalStore.push(externalStoreModel1);
      outputModel.isEnable = true;
      outputModel.insertDate = new Date();

      testObj.inputModel = inputModel;
      testObj.outputModel = outputModel;
    });

    test(`Should error add product`, async () => {
      const inputModel = testObj.inputModel;
      testObj.productRepository.add.resolves([new UnknownException()]);

      const [error] = await testObj.externalProductApiRepository.add(inputModel);

      testObj.productRepository.add.should.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully add product without get price of product (if external store not set)`, async () => {
      const inputModel = testObj.inputModel;
      const outputModel = testObj.outputModel;
      outputModel.externalStore = [];
      testObj.productRepository.add.resolves([null, outputModel]);

      const [error, result] = await testObj.externalProductApiRepository.add(inputModel);

      testObj.productRepository.add.should.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result.externalStore).to.be.length(0);
    });

    test(`Should successfully add product (has error when get price of product)`, async () => {
      const inputModel = testObj.inputModel;
      const outputModel = testObj.outputModel;
      testObj.productRepository.add.resolves([null, outputModel]);
      testObj.fastspringApiRepository.getProductPrice.resolves([new UnknownException()]);

      const [error, result] = await testObj.externalProductApiRepository.add(inputModel);

      testObj.productRepository.add.should.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.calledWith(
        sinon.match('product serial'),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result.externalStore[0]).to.have.include({
        id: testObj.identifierGenerator1.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial',
      });
      expect(result.externalStore[0].price).to.be.length(0);
    });

    test(`Should successfully add product (fill price of product)`, async () => {
      const inputModel = testObj.inputModel;
      const outputModel = testObj.outputModel;
      testObj.productRepository.add.resolves([null, outputModel]);
      const outputExternalModel = new ExternalStoreModel();
      outputExternalModel.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputExternalModel.serial = 'product serial';
      outputExternalModel.price = [{ unit: 'USD', value: 6000, country: 'US' }];
      testObj.fastspringApiRepository.getProductPrice.resolves([null, outputExternalModel]);

      const [error, result] = await testObj.externalProductApiRepository.add(inputModel);

      testObj.productRepository.add.should.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.calledWith(
        sinon.match('product serial'),
      );
      testObj.consoleError.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result.externalStore[0]).to.have.include({
        id: testObj.identifierGenerator1.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial',
      });
      expect(result.externalStore[0].price[0]).to.have.include({
        value: 6000,
        unit: 'USD',
        country: 'US',
      });
    });

    test(`Should successfully add product (has error when upsert price of product on background)`, async () => {
      const inputModel = testObj.inputModel;
      const outputModel = testObj.outputModel;
      testObj.productRepository.add.resolves([null, outputModel]);
      const outputExternalModel = new ExternalStoreModel();
      outputExternalModel.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputExternalModel.serial = 'product serial';
      outputExternalModel.price = [{ unit: 'USD', value: 6000, country: 'US' }];
      testObj.fastspringApiRepository.getProductPrice.resolves([null, outputExternalModel]);
      testObj.productRepository.upsertExternalProductPrice.resolves([new UnknownException()]);

      const [error, result] = await testObj.externalProductApiRepository.add(inputModel);

      testObj.productRepository.add.should.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.calledWith(
        sinon.match('product serial'),
      );
      testObj.productRepository.upsertExternalProductPrice.should.have.callCount(1);
      testObj.productRepository.upsertExternalProductPrice.should.have.calledWith(
        sinon.match.has('id', testObj.identifierGenerator1.generateId()),
      );
      testObj.consoleError.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result.externalStore[0]).to.have.include({
        id: testObj.identifierGenerator1.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial',
      });
      expect(result.externalStore[0].price[0]).to.have.include({
        value: 6000,
        unit: 'USD',
        country: 'US',
      });
    });

    test(`Should successfully add product (has successfully upsert price of product on background)`, async () => {
      const inputModel = testObj.inputModel;
      const outputModel = testObj.outputModel;
      testObj.productRepository.add.resolves([null, outputModel]);
      const outputExternalModel = new ExternalStoreModel();
      outputExternalModel.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputExternalModel.serial = 'product serial';
      outputExternalModel.price = [{ unit: 'USD', value: 6000, country: 'US' }];
      testObj.fastspringApiRepository.getProductPrice.resolves([null, outputExternalModel]);
      testObj.productRepository.upsertExternalProductPrice.resolves([null]);

      const [error, result] = await testObj.externalProductApiRepository.add(inputModel);

      testObj.productRepository.add.should.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.callCount(1);
      testObj.fastspringApiRepository.getProductPrice.should.have.calledWith(
        sinon.match('product serial'),
      );
      testObj.productRepository.upsertExternalProductPrice.should.have.callCount(1);
      testObj.productRepository.upsertExternalProductPrice.should.have.calledWith(
        sinon.match.has('id', testObj.identifierGenerator1.generateId()),
      );
      testObj.consoleError.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
      });
      expect(result.externalStore[0]).to.have.include({
        id: testObj.identifierGenerator1.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial',
      });
      expect(result.externalStore[0].price[0]).to.have.include({
        value: 6000,
        unit: 'USD',
        country: 'US',
      });
    });
  });

  suite(`Upsert external product price`, () => {
    setup(() => {
      const inputModel = new ExternalStoreModel();
      inputModel.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      inputModel.serial = 'product serial';
      inputModel.price = [{ unit: 'USD', value: 6000 }];
      const outputModel = new ExternalStoreModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      outputModel.serial = 'product serial';
      outputModel.price = [{ unit: 'USD', value: 6000 }];

      testObj.inputModel = inputModel;
      testObj.outputModel = outputModel;
    });

    test(`Should error upsert external product price`, async () => {
      const inputModel = testObj.inputModel;
      testObj.productRepository.upsertExternalProductPrice.resolves([new UnknownException()]);

      const [error] = await testObj.externalProductApiRepository.upsertExternalProductPrice(
        inputModel,
      );

      testObj.productRepository.upsertExternalProductPrice.should.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully upsert external product price`, async () => {
      const inputModel = testObj.inputModel;
      const outputModel = testObj.outputModel;
      testObj.productRepository.upsertExternalProductPrice.resolves([null, outputModel]);

      const [error, result] = await testObj.externalProductApiRepository.upsertExternalProductPrice(
        inputModel,
      );

      testObj.productRepository.upsertExternalProductPrice.should.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.an.instanceOf(ExternalStoreModel);
    });
  });

  suite(`Update product`, () => {
    test(`Should error update product`, async () => {
      const inputModel = new ProductModel();
      testObj.productRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.externalProductApiRepository.update(inputModel);

      testObj.productRepository.update.should.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully update product`, async () => {
      const inputModel = new ProductModel();
      testObj.productRepository.update.resolves([null]);

      const [error] = await testObj.externalProductApiRepository.update(inputModel);

      testObj.productRepository.update.should.callCount(1);
      expect(error).to.be.a('null');
    });
  });

  suite(`Update external product`, () => {
    test(`Should error update external product`, async () => {
      const inputModel = new ExternalStoreModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      testObj.productRepository.updateExternalStore.resolves([new UnknownException()]);

      const [error] = await testObj.externalProductApiRepository.updateExternalStore(inputModel);

      testObj.productRepository.updateExternalStore.should.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully update external product`, async () => {
      const inputModel = new ExternalStoreModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      testObj.productRepository.updateExternalStore.resolves([null]);

      const [error] = await testObj.externalProductApiRepository.updateExternalStore(inputModel);

      testObj.productRepository.updateExternalStore.should.callCount(1);
      expect(error).to.be.a('null');
    });
  });

  suite(`Delete product`, () => {
    test(`Should error delete product`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.productRepository.delete.resolves([new UnknownException()]);

      const [error] = await testObj.externalProductApiRepository.delete(inputId);

      testObj.productRepository.delete.should.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully delete product`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.productRepository.delete.resolves([null]);

      const [error] = await testObj.externalProductApiRepository.delete(inputId);

      testObj.productRepository.delete.should.callCount(1);
      expect(error).to.be.a('null');
    });
  });

  suite(`Delete external product`, () => {
    test(`Should error delete external product`, async () => {
      const inputProductId = testObj.identifierGenerator.generateId();
      const inputExternalStoreId = testObj.identifierGenerator1.generateId();
      testObj.productRepository.deleteExternalStore.resolves([new UnknownException()]);

      const [error] = await testObj.externalProductApiRepository.deleteExternalStore(
        inputProductId,
        inputExternalStoreId,
      );

      testObj.productRepository.deleteExternalStore.should.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
      expect(error).to.have.property('httpCode', 400);
    });

    test(`Should successfully delete external product`, async () => {
      const inputProductId = testObj.identifierGenerator.generateId();
      const inputExternalStoreId = testObj.identifierGenerator1.generateId();
      testObj.productRepository.deleteExternalStore.resolves([null]);

      const [error] = await testObj.externalProductApiRepository.deleteExternalStore(
        inputProductId,
        inputExternalStoreId,
      );

      testObj.productRepository.deleteExternalStore.should.callCount(1);
      expect(error).to.be.a('null');
    });
  });
});
