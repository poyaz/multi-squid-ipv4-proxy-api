/**
 * Created by pooya on 4/17/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const ProductModel = require('~src/core/model/productModel');
const PackageModel = require('~src/core/model/packageModel');
const UnknownException = require('~src/core/exception/unknownException');
const NotFoundException = require('~src/core/exception/notFoundException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

const expect = chai.expect;
const testObj = {};

suite(`ProductService`, () => {
  setup(() => {
    const { productRepository, productService } = helper.fakePackageService();

    testObj.productRepository = productRepository;
    testObj.productService = productService;
    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
  });

  suite(`Get all product`, () => {
    test(`Should error get all products`, async () => {
      testObj.productRepository.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.productService.getAll();

      testObj.productRepository.getAll.should.have.callCount(1);
      testObj.productRepository.getAll.should.have.calledWith(sinon.match.instanceOf(ProductModel));
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully get all users`, async () => {
      const outputModel1 = new ProductModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.count = 10;
      outputModel1.price = 3000;
      outputModel1.expireDay = 60;
      outputModel1.isEnable = true;
      outputModel1.insertDate = new Date();
      testObj.productRepository.getAll.resolves([null, [outputModel1]]);

      const [error, result] = await testObj.productService.getAll();

      testObj.productRepository.getAll.should.have.callCount(1);
      testObj.productRepository.getAll.should.have.calledWith(sinon.match.instanceOf(ProductModel));
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
      });
    });
  });

  suite(`Get all enable product`, () => {
    test(`Should error get all enable products`, async () => {
      testObj.productRepository.getAll.resolves([new UnknownException()]);

      const [error] = await testObj.productService.getAllEnable();

      testObj.productRepository.getAll.should.have.callCount(1);
      testObj.productRepository.getAll.should.have.calledWith(
        sinon.match.instanceOf(ProductModel).and(sinon.match.has('isEnable', true)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should successfully get all enable users`, async () => {
      const outputModel1 = new ProductModel();
      outputModel1.id = testObj.identifierGenerator.generateId();
      outputModel1.count = 10;
      outputModel1.price = 3000;
      outputModel1.expireDay = 60;
      outputModel1.isEnable = true;
      outputModel1.insertDate = new Date();
      testObj.productRepository.getAll.resolves([null, [outputModel1]]);

      const [error, result] = await testObj.productService.getAllEnable();

      testObj.productRepository.getAll.should.have.callCount(1);
      testObj.productRepository.getAll.should.have.calledWith(
        sinon.match.instanceOf(ProductModel).and(sinon.match.has('isEnable', true)),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
      });
    });
  });

  suite(`Add product`, () => {
    test(`Should error add new product`, async () => {
      const inputModel = new ProductModel();
      inputModel.count = 10;
      inputModel.price = 3000;
      inputModel.expireDay = 60;
      inputModel.isEnable = true;
      testObj.productRepository.add.resolves([new UnknownException()]);

      const [error] = await testObj.productService.add(inputModel);

      testObj.productRepository.add.should.have.callCount(1);
      testObj.productRepository.add.should.have.calledWith(
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
      outputModel.isEnable = true;
      outputModel.insertDate = new Date();
      testObj.productRepository.add.resolves([null, outputModel]);

      const [error, result] = await testObj.productService.add(inputModel);

      testObj.productRepository.add.should.have.callCount(1);
      testObj.productRepository.add.should.have.calledWith(
        sinon.match
          .instanceOf(ProductModel)
          .and(sinon.match.has('count', sinon.match.number))
          .and(sinon.match.has('price', sinon.match.number))
          .and(sinon.match.has('expireDay', sinon.match.number))
          .and(sinon.match.has('isEnable', sinon.match.bool)),
      );
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(ProductModel);
      expect(result).to.have.include({
        id: testObj.identifierGenerator.generateId(),
        count: 10,
        price: 3000,
        expireDay: 60,
        isEnable: true,
      });
    });
  });

  suite(`Disable product`, () => {
    test(`Should error disable product when get product has error`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.productRepository.getById.resolves([new UnknownException()]);

      const [error] = await testObj.productService.disableById(inputId);

      testObj.productRepository.getById.should.have.callCount(1);
      testObj.productRepository.getById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should error disable product when get product not exist`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.productRepository.getById.resolves([null, null]);

      const [error] = await testObj.productService.disableById(inputId);

      testObj.productRepository.getById.should.have.callCount(1);
      testObj.productRepository.getById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      expect(error).to.be.an.instanceof(NotFoundException);
    });

    test(`Should error disable product`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputFetchModel = new ProductModel();
      outputFetchModel.id = testObj.identifierGenerator.generateId();
      testObj.productRepository.getById.resolves([null, outputFetchModel]);
      testObj.productRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.productService.disableById(inputId);

      testObj.productRepository.getById.should.have.callCount(1);
      testObj.productRepository.getById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.productRepository.update.should.have.callCount(1);
      testObj.productRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(ProductModel)
          .and(sinon.match.has('id', testObj.identifierGenerator.generateId()))
          .and(sinon.match.has('isEnable', false)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should error disable product`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputFetchModel = new ProductModel();
      outputFetchModel.id = testObj.identifierGenerator.generateId();
      testObj.productRepository.getById.resolves([null, outputFetchModel]);
      testObj.productRepository.update.resolves([null]);

      const [error] = await testObj.productService.disableById(inputId);

      testObj.productRepository.getById.should.have.callCount(1);
      testObj.productRepository.getById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.productRepository.update.should.have.callCount(1);
      testObj.productRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(ProductModel)
          .and(sinon.match.has('id', testObj.identifierGenerator.generateId()))
          .and(sinon.match.has('isEnable', false)),
      );
      expect(error).to.be.a('null');
    });
  });

  suite(`Enable product`, () => {
    test(`Should error enable product when get product has error`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.productRepository.getById.resolves([new UnknownException()]);

      const [error] = await testObj.productService.enableById(inputId);

      testObj.productRepository.getById.should.have.callCount(1);
      testObj.productRepository.getById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should error enable product when get product not exist`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.productRepository.getById.resolves([null, null]);

      const [error] = await testObj.productService.enableById(inputId);

      testObj.productRepository.getById.should.have.callCount(1);
      testObj.productRepository.getById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      expect(error).to.be.an.instanceof(NotFoundException);
    });

    test(`Should error enable product`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputFetchModel = new ProductModel();
      outputFetchModel.id = testObj.identifierGenerator.generateId();
      testObj.productRepository.getById.resolves([null, outputFetchModel]);
      testObj.productRepository.update.resolves([new UnknownException()]);

      const [error] = await testObj.productService.enableById(inputId);

      testObj.productRepository.getById.should.have.callCount(1);
      testObj.productRepository.getById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.productRepository.update.should.have.callCount(1);
      testObj.productRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(ProductModel)
          .and(sinon.match.has('id', testObj.identifierGenerator.generateId()))
          .and(sinon.match.has('isEnable', true)),
      );
      expect(error).to.be.an.instanceof(UnknownException);
    });

    test(`Should error enable product`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const outputFetchModel = new ProductModel();
      outputFetchModel.id = testObj.identifierGenerator.generateId();
      testObj.productRepository.getById.resolves([null, outputFetchModel]);
      testObj.productRepository.update.resolves([null]);

      const [error] = await testObj.productService.enableById(inputId);

      testObj.productRepository.getById.should.have.callCount(1);
      testObj.productRepository.getById.should.have.calledWith(
        sinon.match(testObj.identifierGenerator.generateId()),
      );
      testObj.productRepository.update.should.have.callCount(1);
      testObj.productRepository.update.should.have.calledWith(
        sinon.match
          .instanceOf(ProductModel)
          .and(sinon.match.has('id', testObj.identifierGenerator.generateId()))
          .and(sinon.match.has('isEnable', true)),
      );
      expect(error).to.be.a('null');
    });
  });
});
