/**
 * Created by pooya on 4/17/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const { createRequest, createResponse } = require('node-mocks-http');

const helper = require('~src/helper');

const ProductModel = require('~src/core/model/productModel');
const ExtenalStoreModel = require('~src/core/model/extenalStoreModel');
const UnknownException = require('~src/core/exception/unknownException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);
chai.use(chaiAsPromised);

const expect = chai.expect;
const testObj = {};

suite(`ProductController`, () => {
  setup(() => {
    testObj.req = new createRequest();
    testObj.res = new createResponse();

    const { productService, dateTime, productController } = helper.fakeProductController(
      testObj.req,
      testObj.res,
    );

    testObj.productService = productService;
    testObj.dateTime = dateTime;
    testObj.productController = productController;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();

    testObj.dateRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/;
    testObj.token = /.+/;
  });

  suite(`Get all product`, () => {
    test(`Should error get all products`, async () => {
      testObj.productService.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.productController.getAllProduct();

      testObj.productService.getAll.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully get all users`, async () => {
      const outputModel1 = new ProductModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.count = 10;
      outputModel1.price = 3000;
      outputModel1.expireDay = 60;
      const outputExternalStoreModel1 = new ExtenalStoreModel();
      outputExternalStoreModel1.id = testObj.identifierGenerator.generateId();
      outputExternalStoreModel1.type = ExtenalStoreModel.EXTERNAL_STORE_TYPE;
      outputExternalStoreModel1.serial = 'productSerial';
      outputExternalStoreModel1.insertDate = new Date();
      outputModel1.externalStore = [outputExternalStoreModel1];
      outputModel1.isEnable = true;
      outputModel1.insertDate = new Date();
      testObj.productService.getAll.resolves([null, [outputModel1]]);
      testObj.dateTime.gregorianWithTimezoneString.returns('date');

      const [error, result] = await testObj.productController.getAllProduct();

      testObj.productService.getAll.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
        insertDate: 'date',
      });
      expect(result[0].externalStore).to.be.length(1);
      expect(result[0].externalStore[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        type: 'fastspring',
        serial: 'productSerial',
        insertDate: 'date',
      });
    });
  });

  suite(`Get all enable product`, () => {
    test(`Should error get all products`, async () => {
      testObj.productService.getAllEnable.resolves([new UnknownException()]);

      const [error] = await testObj.productController.getAllEnableProduct();

      testObj.productService.getAllEnable.should.have.callCount(1);
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully get all users`, async () => {
      const outputModel1 = new ProductModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.count = 10;
      outputModel1.price = 3000;
      outputModel1.expireDay = 60;
      const outputExternalStoreModel1 = new ExtenalStoreModel();
      outputExternalStoreModel1.id = testObj.identifierGenerator.generateId();
      outputExternalStoreModel1.type = ExtenalStoreModel.EXTERNAL_STORE_TYPE;
      outputExternalStoreModel1.serial = 'productSerial';
      outputExternalStoreModel1.insertDate = new Date();
      outputModel1.externalStore = [outputExternalStoreModel1];
      outputModel1.isEnable = true;
      outputModel1.insertDate = new Date();
      testObj.productService.getAllEnable.resolves([null, [outputModel1]]);
      testObj.dateTime.gregorianWithTimezoneString.returns('date');

      const [error, result] = await testObj.productController.getAllEnableProduct();

      testObj.productService.getAllEnable.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        insertDate: 'date',
      });
      expect(result[0].isEnable).to.be.a('undefined');
      expect(result[0].externalStore).to.be.length(1);
      expect(result[0].externalStore[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        type: 'fastspring',
        serial: 'productSerial',
        insertDate: 'date',
      });
    });
  });

  suite(`Add product`, () => {
    test(`Should error add new product`, async () => {
      testObj.req.body = { count: 10, price: 3000, expireDay: 60, isEnable: true };
      testObj.productService.add.resolves([new UnknownException()]);

      const [error] = await testObj.productController.addProduct();

      testObj.productService.add.should.have.callCount(1);
      testObj.productService.add.should.have.calledWith(
        sinon.match
          .instanceOf(ProductModel)
          .and(sinon.match.has('count', sinon.match.number))
          .and(sinon.match.has('price', sinon.match.number))
          .and(sinon.match.has('expireDay', sinon.match.number))
          .and(sinon.match.has('isEnable', sinon.match.bool)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully add new product`, async () => {
      testObj.req.body = { count: 10, price: 3000, expireDay: 60, isEnable: true };
      const outputModel = new ProductModel();
      outputModel.id = testObj.identifierGenerator.generateId();
      outputModel.count = 10;
      outputModel.price = 3000;
      outputModel.expireDay = 60;
      outputModel.isEnable = true;
      const outputExternalStoreModel1 = new ExtenalStoreModel();
      outputExternalStoreModel1.id = testObj.identifierGenerator.generateId();
      outputExternalStoreModel1.type = ExtenalStoreModel.EXTERNAL_STORE_TYPE;
      outputExternalStoreModel1.serial = 'productSerial';
      outputExternalStoreModel1.insertDate = new Date();
      outputModel.externalStore = [outputExternalStoreModel1];
      outputModel.insertDate = new Date();
      testObj.productService.add.resolves([null, outputModel]);
      testObj.dateTime.gregorianWithTimezoneString.returns('date');

      const [error, result] = await testObj.productController.addProduct();

      testObj.productService.add.should.have.callCount(1);
      testObj.productService.add.should.have.calledWith(
        sinon.match
          .instanceOf(ProductModel)
          .and(sinon.match.has('count', sinon.match.number))
          .and(sinon.match.has('price', sinon.match.number))
          .and(sinon.match.has('expireDay', sinon.match.number))
          .and(sinon.match.has('isEnable', sinon.match.bool)),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.a('object');
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
        insertDate: 'date',
      });
      expect(result.externalStore).to.be.length(1);
      expect(result.externalStore[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        type: 'fastspring',
        serial: 'productSerial',
        insertDate: 'date',
      });
    });
  });

  suite(`Disable product`, () => {
    test(`Should error disable product`, async () => {
      testObj.req.params = { id: testObj.identifierGenerator.generateId() };
      testObj.productService.disableById.resolves([new UnknownException()]);

      const [error] = await testObj.productController.disableProduct();

      testObj.productService.disableById.should.have.callCount(1);
      testObj.productService.disableById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully disable product`, async () => {
      testObj.req.params = { id: testObj.identifierGenerator.generateId() };
      testObj.productService.disableById.resolves([null]);

      const [error] = await testObj.productController.disableProduct();

      testObj.productService.disableById.should.have.callCount(1);
      testObj.productService.disableById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      expect(error).to.be.a('null');
    });
  });

  suite(`Enable product`, () => {
    test(`Should error enable product`, async () => {
      testObj.req.params = { id: testObj.identifierGenerator.generateId() };
      testObj.productService.enableById.resolves([new UnknownException()]);

      const [error] = await testObj.productController.enableProduct();

      testObj.productService.enableById.should.have.callCount(1);
      testObj.productService.enableById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully enable product`, async () => {
      testObj.req.params = { id: testObj.identifierGenerator.generateId() };
      testObj.productService.enableById.resolves([null]);

      const [error] = await testObj.productController.enableProduct();

      testObj.productService.enableById.should.have.callCount(1);
      testObj.productService.enableById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      expect(error).to.be.a('null');
    });
  });

  suite(`Update product`, () => {
    test(`Should error update product`, async () => {
      testObj.req.params = { id: testObj.identifierGenerator.generateId() };
      testObj.req.body = { count: 10, price: 3000, expireDay: 60, isEnable: true };
      testObj.productService.update.resolves([new UnknownException()]);

      const [error] = await testObj.productController.updateProduct();

      testObj.productService.update.should.have.callCount(1);
      testObj.productService.update.should.have.calledWith(
        sinon.match
          .instanceOf(ProductModel)
          .and(sinon.match.has('id', testObj.identifierGenerator.generateId()))
          .and(sinon.match.has('count', sinon.match.number))
          .and(sinon.match.has('price', sinon.match.number))
          .and(sinon.match.has('expireDay', sinon.match.number))
          .and(sinon.match.has('isEnable', sinon.match.bool)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully update product`, async () => {
      testObj.req.params = { id: testObj.identifierGenerator.generateId() };
      testObj.req.body = { count: 10, price: 3000, expireDay: 60, isEnable: true };
      testObj.productService.update.resolves([null]);

      const [error] = await testObj.productController.updateProduct();

      testObj.productService.update.should.have.callCount(1);
      testObj.productService.update.should.have.calledWith(
        sinon.match
          .instanceOf(ProductModel)
          .and(sinon.match.has('id', testObj.identifierGenerator.generateId()))
          .and(sinon.match.has('count', sinon.match.number))
          .and(sinon.match.has('price', sinon.match.number))
          .and(sinon.match.has('expireDay', sinon.match.number))
          .and(sinon.match.has('isEnable', sinon.match.bool)),
      );
      expect(error).to.be.a('null');
    });
  });

  suite(`Delete product`, () => {
    test(`Should error delete product`, async () => {
      testObj.req.params = { id: testObj.identifierGenerator.generateId() };
      testObj.productService.delete.resolves([new UnknownException()]);

      const [error] = await testObj.productController.deleteProduct();

      testObj.productService.delete.should.have.callCount(1);
      testObj.productService.delete.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully delete product`, async () => {
      testObj.req.params = { id: testObj.identifierGenerator.generateId() };
      testObj.productService.delete.resolves([null]);

      const [error] = await testObj.productController.deleteProduct();

      testObj.productService.delete.should.have.callCount(1);
      testObj.productService.delete.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      expect(error).to.be.a('null');
    });
  });
});
