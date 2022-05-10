/**
 * Created by pooya on 4/17/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const ProductModel = require('~src/core/model/productModel');
const ExternalStoreModel = require('~src/core/model/externalStoreModel');
const AlreadyExistException = require('~src/core/exception/alreadyExistException');
const ModelIdNotExistException = require('~src/core/exception/modelIdNotExistException');
const DatabaseExecuteException = require('~src/core/exception/databaseExecuteException');
const DatabaseRollbackException = require('~src/core/exception/databaseRollbackException');
const DatabaseConnectionException = require('~src/core/exception/databaseConnectionException');
const DatabaseMinParamUpdateException = require('~src/core/exception/databaseMinParamUpdateException');

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

/**
 * @property eventually
 * @property rejectedWith
 */
const expect = chai.expect;
const testObj = {};

suite(`ProductPgRepository`, () => {
  setup(() => {
    const {
      postgresDb,
      postgresDbClient,
      dateTime,
      identifierGenerator,
      productRepository,
    } = helper.fakeProductPgRepository();

    testObj.dateTime = dateTime;
    testObj.postgresDb = postgresDb;
    testObj.postgresDbClient = postgresDbClient;
    testObj.identifierGeneratorSystem = identifierGenerator;
    testObj.productRepository = productRepository;

    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
    testObj.identifierGenerator1 = helper.fakeIdentifierGenerator('id-1');

    testObj.fillModelSpy = sinon.spy(testObj.productRepository, '_fillModel');
    testObj.fillExternalStoreModelSpy = sinon.spy(
      testObj.productRepository,
      '_fillExternalStoreModel',
    );
    testObj.fillExternalProductPrice = sinon.spy(
      testObj.productRepository,
      '_fillExternalProductPrice',
    );
  });

  teardown(() => {
    testObj.fillModelSpy.restore();
    testObj.fillExternalStoreModelSpy.restore();
    testObj.fillExternalProductPrice.restore();
  });

  suite(`Get all products`, () => {
    test(`Should error get all when execute query`, async () => {
      const filterInput = new ProductModel();
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.productRepository.getAll(filterInput);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully get all and return empty array`, async () => {
      const filterInput = new ProductModel();
      const fetchQuery = {
        get rowCount() {
          return 0;
        },
        get rows() {
          return [];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.productRepository.getAll(filterInput);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.fillModelSpy.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should successfully get all and return records`, async () => {
      const filterInput = new ProductModel();
      const fetchQuery = {
        get rowCount() {
          return 2;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              count: 6,
              price: 3000,
              expire_day: 30,
              is_enable: true,
              external_store_id: testObj.identifierGenerator1.generateId(),
              external_store_type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
              external_store_price: [{ value: 10, unit: 'usd', country: 'us' }],
              external_store_serial: 'productSerial1',
              external_store_insert_date: '2021-08-23 13:37:50',
              insert_date: '2021-08-23 13:37:50',
              update_date: null,
              delete_date: null,
            },
            {
              id: testObj.identifierGenerator.generateId(),
              count: 6,
              price: 3000,
              expire_day: 30,
              is_enable: true,
              external_store_id: testObj.identifierGenerator1.generateId(),
              external_store_type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
              external_store_serial: 'productSerial2',
              external_store_price: [],
              external_store_insert_date: '2021-08-23 13:37:50',
              insert_date: '2021-08-23 13:37:50',
              update_date: null,
              delete_date: null,
            },
            {
              id: testObj.identifierGenerator1.generateId(),
              count: 2,
              price: 1000,
              expire_day: 30,
              is_enable: true,
              external_store_id: null,
              external_store_type: null,
              external_store_serial: null,
              external_store_price: [],
              external_store_insert_date: null,
              insert_date: '2021-08-23 13:37:50',
              update_date: null,
              delete_date: null,
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);
      testObj.dateTime.gregorianDateWithTimezone.returns('date');

      const [error, result] = await testObj.productRepository.getAll(filterInput);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.fillModelSpy.should.have.callCount(3);
      expect(error).to.be.a('null');
      expect(result).to.be.length(2);
      expect(result[0]).to.be.instanceOf(ProductModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        count: 6,
        price: 3000,
        expireDay: 30,
        isEnable: true,
        insertDate: 'date',
      });
      expect(result[0].externalStore).to.be.length(2);
      expect(result[0].externalStore[0]).to.be.instanceOf(ExternalStoreModel).and.includes({
        id: testObj.identifierGenerator1.generateId(),
        productId: testObj.identifierGenerator.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'productSerial1',
        insertDate: 'date',
      });
      expect(result[0].externalStore[0].price[0]).and.includes({
        value: 10,
        unit: 'USD',
        country: 'US',
      });
      expect(result[0].externalStore[1]).to.be.instanceOf(ExternalStoreModel).and.includes({
        id: testObj.identifierGenerator1.generateId(),
        productId: testObj.identifierGenerator.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'productSerial2',
        insertDate: 'date',
      });
      expect(result[1]).to.be.instanceOf(ProductModel).and.includes({
        id: testObj.identifierGenerator1.generateId(),
        count: 2,
        price: 1000,
        expireDay: 30,
        isEnable: true,
        insertDate: 'date',
      });
      expect(result[1].externalStore).to.be.length(0);
    });

    test(`Should successfully get all with filter (with isEnable)`, async () => {
      const filterInput = new ProductModel();
      filterInput.isEnable = false;
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              count: 6,
              price: 3000,
              expire_day: 30,
              is_enable: false,
              external_store_id: testObj.identifierGenerator1.generateId(),
              external_store_type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
              external_store_serial: 'productSerial1',
              external_store_price: [],
              external_store_insert_date: '2021-08-23 13:37:50',
              insert_date: '2021-08-23 13:37:50',
              update_date: null,
              delete_date: null,
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);
      testObj.dateTime.gregorianDateWithTimezone.returns('date');

      const [error, result] = await testObj.productRepository.getAll(filterInput);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has('values', sinon.match.array.deepEquals([filterInput.isEnable])),
      );
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.instanceOf(ProductModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        count: 6,
        price: 3000,
        expireDay: 30,
        isEnable: false,
        insertDate: 'date',
      });
      expect(result[0].externalStore).to.be.length(1);
      expect(result[0].externalStore[0]).to.be.instanceOf(ExternalStoreModel).and.includes({
        id: testObj.identifierGenerator1.generateId(),
        productId: testObj.identifierGenerator.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'productSerial1',
        insertDate: 'date',
      });
    });
  });

  suite(`Get product by id`, () => {
    test(`Should error get product by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.productRepository.getById(inputId);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully get product by id and return null`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const fetchQuery = {
        get rowCount() {
          return 0;
        },
        get rows() {
          return [];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.productRepository.getById(inputId);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.fillModelSpy.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.a('null');
    });

    test(`Should successfully get product by id and return record`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const fetchQuery = {
        get rowCount() {
          return 2;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              count: 6,
              price: 3000,
              expire_day: 30,
              external_store_id: testObj.identifierGenerator1.generateId(),
              external_store_type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
              external_store_serial: 'productSerial1',
              external_store_price: [{ value: 10, unit: 'usd', country: 'us' }],
              external_store_insert_date: '2021-08-23 13:37:50',
              is_enable: true,
              insert_date: '2021-08-23 13:37:50',
              update_date: null,
              delete_date: null,
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);
      testObj.dateTime.gregorianDateWithTimezone.returns('date');

      const [error, result] = await testObj.productRepository.getById(inputId);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(ProductModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        count: 6,
        price: 3000,
        expireDay: 30,
        isEnable: true,
        insertDate: 'date',
      });
      expect(result.externalStore).to.be.length(1);
      expect(result.externalStore[0]).to.be.instanceOf(ExternalStoreModel).and.includes({
        id: testObj.identifierGenerator1.generateId(),
        productId: testObj.identifierGenerator.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'productSerial1',
        insertDate: 'date',
      });
      expect(result.externalStore[0].price[0]).and.includes({
        value: 10,
        unit: 'USD',
        country: 'US',
      });
    });
  });

  suite(`Add new product`, () => {
    setup(() => {
      const inputModel = new ProductModel();
      inputModel.count = 6;
      inputModel.price = 3000;
      inputModel.expireDay = 30;
      const inputExternalStoreModel = new ExternalStoreModel();
      inputExternalStoreModel.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      inputExternalStoreModel.serial = 'productSerial';
      inputModel.externalStore.push(inputExternalStoreModel);
      inputModel.isEnable = true;
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );

      testObj.inputModel = inputModel;
    });

    test(`Should error add new product when create database client`, async () => {
      const inputModel = testObj.inputModel;
      const connectionError = new Error('Connection error');
      testObj.postgresDb.connect.throws(connectionError);

      const [error] = await testObj.productRepository.add(inputModel);

      testObj.postgresDb.connect.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseConnectionException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', connectionError);
    });

    test(`Should error add new product when create start transaction`, async () => {
      const inputModel = testObj.inputModel;
      const queryError = new Error('Query error');
      testObj.postgresDbClient.query.onCall(0).throws(queryError);

      const [error] = await testObj.productRepository.add(inputModel);

      testObj.postgresDb.connect.should.have.callCount(1);
      testObj.postgresDbClient.query.should.have.callCount(1);
      testObj.postgresDbClient.query.getCall(0).should.calledWith('BEGIN');
      testObj.postgresDbClient.release.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should error add new product in database when execute other query`, async () => {
      const inputModel = testObj.inputModel;
      testObj.postgresDbClient.query.onCall(0).resolves();
      const queryError = new Error('Query error');
      testObj.postgresDbClient.query.onCall(1).throws(queryError);
      testObj.postgresDbClient.query.onCall(2).resolves();

      const [error] = await testObj.productRepository.add(inputModel);

      testObj.postgresDb.connect.should.have.callCount(1);
      testObj.postgresDbClient.query.should.have.callCount(3);
      testObj.postgresDbClient.query.getCall(0).should.calledWith('BEGIN');
      testObj.postgresDbClient.query.getCall(2).should.calledWith('ROLLBACK');
      testObj.postgresDbClient.release.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should error add new product in database when external store record already exist`, async () => {
      const inputModel = testObj.inputModel;
      testObj.postgresDbClient.query.onCall(0).resolves();
      const queryError = new Error(
        'duplicate key value violates unique constraint "external_store_serial"',
      );
      testObj.postgresDbClient.query.onCall(1).throws(queryError);
      testObj.postgresDbClient.query.onCall(2).resolves();

      const [error] = await testObj.productRepository.add(inputModel);

      testObj.postgresDb.connect.should.have.callCount(1);
      testObj.postgresDbClient.query.should.have.callCount(3);
      testObj.postgresDbClient.query.getCall(0).should.calledWith('BEGIN');
      testObj.postgresDbClient.query.getCall(2).should.calledWith('ROLLBACK');
      testObj.postgresDbClient.release.should.have.callCount(1);
      expect(error).to.be.an.instanceof(AlreadyExistException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.deep.property('additionalInfo', [
        { message: 'The record of external store already exist.' },
      ]);
    });

    test(`Should error add new product in database when execute other query and rollback`, async () => {
      const inputModel = testObj.inputModel;
      testObj.postgresDbClient.query.onCall(0).resolves();
      const queryError = new Error('Query error');
      testObj.postgresDbClient.query.onCall(1).throws(queryError);
      const rollbackError = new Error('Rollback error');
      testObj.postgresDbClient.query.onCall(2).throws(rollbackError);

      const [error] = await testObj.productRepository.add(inputModel);

      testObj.postgresDb.connect.should.have.callCount(1);
      testObj.postgresDbClient.query.should.have.callCount(3);
      testObj.postgresDbClient.query.getCall(0).should.calledWith('BEGIN');
      testObj.postgresDbClient.query.getCall(2).should.calledWith('ROLLBACK');
      testObj.postgresDbClient.release.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseRollbackException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
      expect(error).to.have.property('rollbackErrorInfo', rollbackError);
    });

    test(`Should successfully add new product in database`, async () => {
      const inputModel = testObj.inputModel;
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );
      testObj.postgresDbClient.query.onCall(0).resolves();
      const fetchProductQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              count: 6,
              price: 3000,
              expire_day: 30,
              is_enable: true,
              insert_date: '2021-08-23 13:37:50',
              update_date: null,
              delete_date: null,
            },
          ];
        },
      };
      testObj.postgresDbClient.query.onCall(1).resolves(fetchProductQuery);
      const fetchExternalStoreQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              external_store_id: testObj.identifierGenerator.generateId(),
              external_store_type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
              external_store_serial: 'productSerial',
              external_store_price: [],
              external_store_insert_date: '2021-08-23 13:37:50',
            },
          ];
        },
      };
      testObj.postgresDbClient.query.onCall(2).resolves(fetchExternalStoreQuery);
      testObj.postgresDbClient.query.onCall(3).resolves();
      testObj.dateTime.gregorianDateWithTimezone.returns('date');

      const [error, result] = await testObj.productRepository.add(inputModel);

      testObj.postgresDb.connect.should.have.callCount(1);
      testObj.postgresDbClient.query.should.have.callCount(4);
      testObj.postgresDbClient.query.getCall(0).should.calledWith('BEGIN');
      const sinonMatch1 = sinon.match.has(
        'values',
        sinon.match.array
          .startsWith([
            testObj.identifierGenerator.generateId(),
            inputModel.count,
            inputModel.price,
            inputModel.expireDay,
            inputModel.isEnable,
          ])
          .and(sinon.match.has('length', 6)),
      );
      testObj.postgresDbClient.query.getCall(1).should.calledWith(sinonMatch1);
      const sinonMatch2 = sinon.match.has('values', sinon.match.has('length', 3));
      testObj.postgresDbClient.query.getCall(2).should.calledWith(sinonMatch2);
      testObj.postgresDbClient.query.getCall(3).should.calledWith('END');
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.instanceOf(ProductModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        count: 6,
        price: 3000,
        expireDay: 30,
        isEnable: true,
        insertDate: 'date',
      });
      expect(result.externalStore).to.be.length(1);
      expect(result.externalStore[0]).to.be.instanceOf(ExternalStoreModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        productId: testObj.identifierGenerator.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'productSerial',
        insertDate: 'date',
      });
      expect(result.externalStore[0].price).to.be.length(0);
    });

    test(`Should successfully add new product in database without add in another table`, async () => {
      const inputModel = testObj.inputModel;
      inputModel.externalStore = [];
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );
      testObj.postgresDbClient.query.onCall(0).resolves();
      const fetchProductQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              count: 6,
              price: 3000,
              expire_day: 30,
              is_enable: true,
              insert_date: '2021-08-23 13:37:50',
              update_date: null,
              delete_date: null,
            },
          ];
        },
      };
      testObj.postgresDbClient.query.onCall(1).resolves(fetchProductQuery);
      testObj.postgresDbClient.query.onCall(2).resolves();
      testObj.dateTime.gregorianDateWithTimezone.returns('date');

      const [error, result] = await testObj.productRepository.add(inputModel);

      testObj.postgresDb.connect.should.have.callCount(1);
      testObj.postgresDbClient.query.should.have.callCount(3);
      testObj.postgresDbClient.query.getCall(0).should.calledWith('BEGIN');
      const sinonMatch1 = sinon.match.has(
        'values',
        sinon.match.array
          .startsWith([
            testObj.identifierGenerator.generateId(),
            inputModel.count,
            inputModel.price,
            inputModel.expireDay,
            inputModel.isEnable,
          ])
          .and(sinon.match.has('length', 6)),
      );
      testObj.postgresDbClient.query.getCall(1).should.calledWith(sinonMatch1);
      testObj.postgresDbClient.query.getCall(2).should.calledWith('END');
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.instanceOf(ProductModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        count: 6,
        price: 3000,
        expireDay: 30,
        isEnable: true,
        insertDate: 'date',
      });
      expect(result.externalStore).to.be.length(0);
    });
  });

  suite(`Add new external store product`, () => {
    setup(() => {
      const inputModel = new ExternalStoreModel();
      inputModel.productId = testObj.identifierGenerator1.generateId();
      inputModel.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      inputModel.serial = 'product serial';

      testObj.inputModel = inputModel;
    });

    test(`Should error add new external store product`, async () => {
      const inputModel = testObj.inputModel;
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );
      testObj.dateTime.gregorianCurrentDateWithTimezoneString.returns('date');
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.productRepository.addExternalStoreProduct(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array
            .deepEquals([
              testObj.identifierGenerator.generateId(),
              testObj.identifierGenerator1.generateId(),
              inputModel.type,
              inputModel.serial,
              'date',
            ])
            .and(sinon.match.has('length', 5)),
        ),
      );
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should error add new external store product in database when external store record already exist`, async () => {
      const inputModel = testObj.inputModel;
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );
      testObj.dateTime.gregorianCurrentDateWithTimezoneString.returns('date');
      const queryError = new Error(
        'duplicate key value violates unique constraint "external_store_serial"',
      );
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.productRepository.addExternalStoreProduct(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array
            .deepEquals([
              testObj.identifierGenerator.generateId(),
              testObj.identifierGenerator1.generateId(),
              inputModel.type,
              inputModel.serial,
              'date',
            ])
            .and(sinon.match.has('length', 5)),
        ),
      );
      expect(error).to.be.an.instanceof(AlreadyExistException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.deep.property('additionalInfo', [
        { message: 'The record of external store already exist.' },
      ]);
    });

    test(`Should successfully add new external store product`, async () => {
      const inputModel = testObj.inputModel;
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );
      testObj.dateTime.gregorianCurrentDateWithTimezoneString.returns('date');
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              product_id: testObj.identifierGenerator1.generateId(),
              type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
              serial: 'product serial',
              insert_date: '2021-08-23 13:37:50',
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);
      testObj.dateTime.gregorianDateWithTimezone.returns('date');

      const [error, result] = await testObj.productRepository.addExternalStoreProduct(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array
            .deepEquals([
              testObj.identifierGenerator.generateId(),
              testObj.identifierGenerator1.generateId(),
              inputModel.type,
              inputModel.serial,
              'date',
            ])
            .and(sinon.match.has('length', 5)),
        ),
      );
      testObj.fillExternalStoreModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.have.instanceOf(ExternalStoreModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        productId: testObj.identifierGenerator1.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        serial: 'product serial',
        insertDate: 'date',
      });
    });
  });

  suite(`Upsert external product price`, () => {
    setup(() => {
      const inputModel = new ExternalStoreModel();
      inputModel.id = testObj.identifierGenerator1.generateId();
      inputModel.type = ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING;
      inputModel.productId = testObj.identifierGenerator.generateId();
      inputModel.serial = 'product serial';
      inputModel.price = [
        { value: 1000, unit: 'USD', country: 'US' },
        { value: 100, unit: 'EUR', country: 'DE' },
      ];

      testObj.inputModel = inputModel;
    });

    test(`Should error upsert external product price`, async () => {
      const inputModel = testObj.inputModel;
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.productRepository.upsertExternalProductPrice(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully upsert external product price (don't execute if price is empty)`, async () => {
      const inputModel = testObj.inputModel;
      inputModel.price = [];

      const [error, result] = await testObj.productRepository.upsertExternalProductPrice(
        inputModel,
      );

      testObj.postgresDb.query.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.have.instanceOf(ExternalStoreModel).and.includes({
        id: testObj.identifierGenerator1.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        productId: testObj.identifierGenerator.generateId(),
        serial: 'product serial',
      });
      expect(result.price).to.be.length(0);
    });

    test(`Should successfully upsert external product price`, async () => {
      const inputModel = testObj.inputModel;
      const fetchQuery = {
        get rowCount() {
          return 2;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              external_store_id: testObj.identifierGenerator1.generateId(),
              price: 1000,
              unit: 'usd',
              country: 'us',
              insert_date: '2021-08-23 13:37:50',
              update_date: '2021-08-23 13:37:50',
            },
            {
              id: testObj.identifierGenerator.generateId(),
              external_store_id: testObj.identifierGenerator1.generateId(),
              price: 100,
              unit: 'eur',
              country: 'de',
              insert_date: '2021-08-23 13:37:50',
              update_date: '2021-08-23 13:37:50',
            },
          ];
        },
      };
      testObj.identifierGeneratorSystem.generateId.returns(
        testObj.identifierGenerator.generateId(),
      );
      testObj.dateTime.gregorianCurrentDateWithTimezoneString.returns('2021-08-23 13:37:50');
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.productRepository.upsertExternalProductPrice(
        inputModel,
      );

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.postgresDb.query.should.have.calledWith(
        sinon.match.has(
          'values',
          sinon.match.array
            .deepEquals([inputModel.id, '2021-08-23 13:37:50', JSON.stringify(inputModel.price)])
            .and(sinon.match.has('length', 3)),
        ),
      );
      testObj.fillExternalProductPrice.should.have.callCount(2);
      expect(error).to.be.a('null');
      expect(result).to.have.instanceOf(ExternalStoreModel).and.includes({
        id: testObj.identifierGenerator1.generateId(),
        type: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        productId: testObj.identifierGenerator.generateId(),
        serial: 'product serial',
      });
      expect(result.price).to.be.length(2);
      expect(result.price[0]).to.be.includes({
        unit: 'USD',
        value: 1000,
        country: 'US',
      });
      expect(result.price[1]).to.be.includes({
        unit: 'EUR',
        value: 100,
        country: 'DE',
      });
    });
  });

  suite(`Update product`, () => {
    test(`Should error update product when model id not found`, async () => {
      const inputModel = new ProductModel();

      const [error] = await testObj.productRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(0);
      expect(error).to.be.an.instanceof(ModelIdNotExistException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', true);
    });

    test(`Should error update product when model property not set`, async () => {
      const inputModel = new ProductModel();
      inputModel.id = testObj.identifierGenerator.generateId();

      const [error] = await testObj.productRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(0);
      expect(error).to.be.an.instanceof(DatabaseMinParamUpdateException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', true);
    });

    test(`Should error update product when execute query`, async () => {
      const inputModel = new ProductModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.isEnable = true;
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.productRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully update product`, async () => {
      const inputModel = new ProductModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.isEnable = true;
      testObj.postgresDb.query.resolves();

      const [error] = await testObj.productRepository.update(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });

  suite(`Update external store product`, () => {
    test(`Should error update external store product when model id not found`, async () => {
      const inputModel = new ExternalStoreModel();

      const [error] = await testObj.productRepository.updateExternalStore(inputModel);

      testObj.postgresDb.query.should.have.callCount(0);
      expect(error).to.be.an.instanceof(ModelIdNotExistException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', true);
    });

    test(`Should error update external store product when model property not set`, async () => {
      const inputModel = new ExternalStoreModel();
      inputModel.id = testObj.identifierGenerator.generateId();

      const [error] = await testObj.productRepository.updateExternalStore(inputModel);

      testObj.postgresDb.query.should.have.callCount(0);
      expect(error).to.be.an.instanceof(DatabaseMinParamUpdateException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', true);
    });

    test(`Should error update external store product when execute query`, async () => {
      const inputModel = new ExternalStoreModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.serial = 'productSerial';
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.productRepository.updateExternalStore(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should error update external store product external store record already exist`, async () => {
      const inputModel = new ExternalStoreModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.serial = 'productSerial';
      const queryError = new Error(
        'duplicate key value violates unique constraint "external_store_serial"',
      );
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.productRepository.updateExternalStore(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(AlreadyExistException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.deep.property('additionalInfo', [
        { message: 'The record of external store already exist.' },
      ]);
    });

    test(`Should successfully external store product product`, async () => {
      const inputModel = new ExternalStoreModel();
      inputModel.id = testObj.identifierGenerator.generateId();
      inputModel.serial = 'productSerial';
      testObj.postgresDb.query.resolves();

      const [error] = await testObj.productRepository.updateExternalStore(inputModel);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.a('null');
    });
  });

  suite(`delete product`, () => {
    test(`Should error delete product when create database client`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const connectionError = new Error('Connection error');
      testObj.postgresDb.connect.throws(connectionError);

      const [error] = await testObj.productRepository.delete(inputId);

      testObj.postgresDb.connect.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseConnectionException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', connectionError);
    });

    test(`Should error delete product when create start transaction`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const queryError = new Error('Query error');
      testObj.postgresDbClient.query.onCall(0).throws(queryError);

      const [error] = await testObj.productRepository.delete(inputId);

      testObj.postgresDb.connect.should.have.callCount(1);
      testObj.postgresDbClient.query.should.have.callCount(1);
      testObj.postgresDbClient.query.getCall(0).should.calledWith('BEGIN');
      testObj.postgresDbClient.release.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should error delete product in database when execute other query`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.postgresDbClient.query.onCall(0).resolves();
      const queryError = new Error('Query error');
      testObj.postgresDbClient.query.onCall(1).throws(queryError);
      testObj.postgresDbClient.query.onCall(2).resolves();

      const [error] = await testObj.productRepository.delete(inputId);

      testObj.postgresDb.connect.should.have.callCount(1);
      testObj.postgresDbClient.query.should.have.callCount(3);
      testObj.postgresDbClient.query.getCall(0).should.calledWith('BEGIN');
      testObj.postgresDbClient.query.getCall(2).should.calledWith('ROLLBACK');
      testObj.postgresDbClient.release.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should error delete product in database when execute other query and rollback`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.postgresDbClient.query.onCall(0).resolves();
      const queryError = new Error('Query error');
      testObj.postgresDbClient.query.onCall(1).throws(queryError);
      const rollbackError = new Error('Rollback error');
      testObj.postgresDbClient.query.onCall(2).throws(rollbackError);

      const [error] = await testObj.productRepository.delete(inputId);

      testObj.postgresDb.connect.should.have.callCount(1);
      testObj.postgresDbClient.query.should.have.callCount(3);
      testObj.postgresDbClient.query.getCall(0).should.calledWith('BEGIN');
      testObj.postgresDbClient.query.getCall(2).should.calledWith('ROLLBACK');
      testObj.postgresDbClient.release.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseRollbackException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
      expect(error).to.have.property('rollbackErrorInfo', rollbackError);
    });

    test(`Should successfully delete product in database`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      testObj.postgresDbClient.query.onCall(0).resolves();
      testObj.postgresDbClient.query.onCall(1).resolves();
      testObj.postgresDbClient.query.onCall(2).resolves();
      testObj.postgresDbClient.query.onCall(3).resolves();
      testObj.postgresDbClient.query.onCall(4).resolves();

      const [error] = await testObj.productRepository.delete(inputId);

      testObj.postgresDb.connect.should.have.callCount(1);
      testObj.postgresDbClient.query.should.have.callCount(5);
      testObj.postgresDbClient.query.getCall(0).should.calledWith('BEGIN');
      const sinonMatch1 = sinon.match.has('text', sinon.match(/product/));
      testObj.postgresDbClient.query.getCall(1).should.calledWith(sinonMatch1);
      const sinonMatch2 = sinon.match.has('text', sinon.match(/external_store/));
      testObj.postgresDbClient.query.getCall(2).should.calledWith(sinonMatch2);
      const sinonMatch3 = sinon.match.has(
        'text',
        sinon.match(/external_product_price/).and(sinon.match(/external_store/)),
      );
      testObj.postgresDbClient.query.getCall(3).should.calledWith(sinonMatch3);
      testObj.postgresDbClient.query.getCall(4).should.calledWith('END');
      expect(error).to.be.a('null');
    });
  });

  suite(`delete external store product`, () => {
    test(`Should error delete external store product when create database client`, async () => {
      const inputProductId = testObj.identifierGenerator.generateId();
      const inputExternalStoreId = testObj.identifierGenerator.generateId();
      const connectionError = new Error('Connection error');
      testObj.postgresDb.connect.throws(connectionError);

      const [error] = await testObj.productRepository.deleteExternalStore(
        inputProductId,
        inputExternalStoreId,
      );

      testObj.postgresDb.connect.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseConnectionException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', connectionError);
    });

    test(`Should error delete external store product when create start transaction`, async () => {
      const inputProductId = testObj.identifierGenerator.generateId();
      const inputExternalStoreId = testObj.identifierGenerator.generateId();
      const queryError = new Error('Query error');
      testObj.postgresDbClient.query.onCall(0).throws(queryError);

      const [error] = await testObj.productRepository.deleteExternalStore(
        inputProductId,
        inputExternalStoreId,
      );

      testObj.postgresDb.connect.should.have.callCount(1);
      testObj.postgresDbClient.query.should.have.callCount(1);
      testObj.postgresDbClient.query.getCall(0).should.calledWith('BEGIN');
      testObj.postgresDbClient.release.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should error delete external store product when execute other query`, async () => {
      const inputProductId = testObj.identifierGenerator.generateId();
      const inputExternalStoreId = testObj.identifierGenerator.generateId();
      testObj.postgresDbClient.query.onCall(0).resolves();
      const queryError = new Error('Query error');
      testObj.postgresDbClient.query.onCall(1).throws(queryError);
      testObj.postgresDbClient.query.onCall(2).resolves();

      const [error] = await testObj.productRepository.deleteExternalStore(
        inputProductId,
        inputExternalStoreId,
      );

      testObj.postgresDb.connect.should.have.callCount(1);
      testObj.postgresDbClient.query.should.have.callCount(3);
      testObj.postgresDbClient.query.getCall(0).should.calledWith('BEGIN');
      testObj.postgresDbClient.query.getCall(2).should.calledWith('ROLLBACK');
      testObj.postgresDbClient.release.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should error delete external store product when execute other query and rollback`, async () => {
      const inputProductId = testObj.identifierGenerator.generateId();
      const inputExternalStoreId = testObj.identifierGenerator.generateId();
      testObj.postgresDbClient.query.onCall(0).resolves();
      const queryError = new Error('Query error');
      testObj.postgresDbClient.query.onCall(1).throws(queryError);
      const rollbackError = new Error('Rollback error');
      testObj.postgresDbClient.query.onCall(2).throws(rollbackError);

      const [error] = await testObj.productRepository.deleteExternalStore(
        inputProductId,
        inputExternalStoreId,
      );

      testObj.postgresDb.connect.should.have.callCount(1);
      testObj.postgresDbClient.query.should.have.callCount(3);
      testObj.postgresDbClient.query.getCall(0).should.calledWith('BEGIN');
      testObj.postgresDbClient.query.getCall(2).should.calledWith('ROLLBACK');
      testObj.postgresDbClient.release.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseRollbackException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
      expect(error).to.have.property('rollbackErrorInfo', rollbackError);
    });

    test(`Should successfully delete external store product`, async () => {
      const inputProductId = testObj.identifierGenerator.generateId();
      const inputExternalStoreId = testObj.identifierGenerator.generateId();
      testObj.postgresDbClient.query.onCall(0).resolves();
      testObj.postgresDbClient.query.onCall(1).resolves();
      testObj.postgresDbClient.query.onCall(2).resolves();
      testObj.postgresDbClient.query.onCall(3).resolves();

      const [error] = await testObj.productRepository.deleteExternalStore(
        inputProductId,
        inputExternalStoreId,
      );

      testObj.postgresDb.connect.should.have.callCount(1);
      testObj.postgresDbClient.query.should.have.callCount(4);
      testObj.postgresDbClient.query.getCall(0).should.calledWith('BEGIN');
      const sinonMatch1 = sinon.match.has('text', sinon.match(/external_store/));
      testObj.postgresDbClient.query.getCall(1).should.calledWith(sinonMatch1);
      const sinonMatch2 = sinon.match.has(
        'text',
        sinon.match(/external_product_price/).and(sinon.match(/external_store/)),
      );
      testObj.postgresDbClient.query.getCall(2).should.calledWith(sinonMatch2);
      testObj.postgresDbClient.query.getCall(3).should.calledWith('END');
      expect(error).to.be.a('null');
    });
  });
});
