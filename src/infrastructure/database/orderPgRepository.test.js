/**
 * Created by pooya on 4/17/22.
 */

const chai = require('chai');
const sinon = require('sinon');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const helper = require('~src/helper');

const OrderModel = require('~src/core/model/orderModel');
const SubscriptionModel = require('~src/core/model/subscriptionModel');
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

suite(`OrderPgRepository`, () => {
  setup(() => {
    const {
      postgresDb,
      postgresDbClient,
      dateTime,
      identifierGenerator,
      orderRepository,
    } = helper.fakeOrderPgRepository();

    testObj.dateTime = dateTime;
    testObj.postgresDb = postgresDb;
    testObj.postgresDbClient = postgresDbClient;
    testObj.identifierGeneratorSystem = identifierGenerator;
    testObj.orderRepository = orderRepository;

    testObj.identifierGenerator = helper.fakeIdentifierGenerator();
    testObj.identifierGenerator1 = helper.fakeIdentifierGenerator('id-1');
    testObj.identifierGenerator2 = helper.fakeIdentifierGenerator('id-2');
    testObj.identifierGenerator3 = helper.fakeIdentifierGenerator('id-3');

    testObj.fillModelSpy = sinon.spy(testObj.orderRepository, '_fillModel');
    testObj.fillSubscriptionModelSpy = sinon.spy(testObj.orderRepository, '_fillSubscriptionModel');
  });

  teardown(() => {
    testObj.fillModelSpy.restore();
    testObj.fillSubscriptionModelSpy.restore();
  });

  suite(`Get order by id`, () => {
    test(`Should error get order by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.orderRepository.getById(inputId);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully get order by id and return null`, async () => {
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

      const [error, result] = await testObj.orderRepository.getById(inputId);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.fillModelSpy.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.a('null');
    });

    test(`Should successfully get order by id and return null`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              user_id: testObj.identifierGenerator1.generateId(),
              username: 'user',
              product_id: testObj.identifierGenerator2.generateId(),
              package_id: testObj.identifierGenerator3.generateId(),
              serial: 'orderSerial',
              service_name: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
              status: OrderModel.STATUS_SUCCESS,
              last_subscription_status: SubscriptionModel.STATUS_ACTIVATED,
              package_count: 3,
              package_proxy_type: 'isp',
              package_country_code: 'GB',
              insert_date: '2021-08-23 13:37:50',
              update_date: null,
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);
      testObj.dateTime.gregorianDateWithTimezone.returns('date');

      const [error, result] = await testObj.orderRepository.getById(inputId);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(OrderModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator1.generateId(),
        productId: testObj.identifierGenerator2.generateId(),
        packageId: testObj.identifierGenerator3.generateId(),
        username: 'user',
        orderSerial: 'orderSerial',
        serviceName: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        status: OrderModel.STATUS_SUCCESS,
        lastSubscriptionStatus: SubscriptionModel.STATUS_ACTIVATED,
        insertDate: 'date',
      });
      expect(result.prePackageOrderInfo).to.be.includes({
        count: 3,
        proxyType: 'isp',
        countryCode: 'GB',
      });
    });
  });

  suite(`Get all order`, () => {
    test(`Should error get all order`, async () => {
      const inputFilter = new OrderModel();
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.orderRepository.getAll(inputFilter);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully get by id and return empty data`, async () => {
      const inputFilter = new OrderModel();
      const fetchQuery = {
        get rowCount() {
          return 0;
        },
        get rows() {
          return [];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);

      const [error, result] = await testObj.orderRepository.getAll(inputFilter);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.fillModelSpy.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.length(0);
    });

    test(`Should successfully get by id and return null`, async () => {
      const inputFilter = new OrderModel();
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              user_id: testObj.identifierGenerator1.generateId(),
              username: 'user',
              product_id: testObj.identifierGenerator2.generateId(),
              package_id: testObj.identifierGenerator3.generateId(),
              serial: 'orderSerial',
              service_name: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
              status: OrderModel.STATUS_SUCCESS,
              last_subscription_status: SubscriptionModel.STATUS_ACTIVATED,
              package_count: 3,
              package_proxy_type: 'isp',
              package_country_code: 'GB',
              insert_date: '2021-08-23 13:37:50',
              update_date: null,
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);
      testObj.dateTime.gregorianDateWithTimezone.returns('date');

      const [error, result] = await testObj.orderRepository.getAll(inputFilter);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.fillModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.length(1);
      expect(result[0]).to.be.instanceOf(OrderModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        userId: testObj.identifierGenerator1.generateId(),
        productId: testObj.identifierGenerator2.generateId(),
        packageId: testObj.identifierGenerator3.generateId(),
        username: 'user',
        orderSerial: 'orderSerial',
        serviceName: ExternalStoreModel.EXTERNAL_STORE_TYPE_FASTSPRING,
        status: OrderModel.STATUS_SUCCESS,
        lastSubscriptionStatus: SubscriptionModel.STATUS_ACTIVATED,
        insertDate: 'date',
      });
      expect(result[0].prePackageOrderInfo).to.be.includes({
        count: 3,
        proxyType: 'isp',
        countryCode: 'GB',
      });
    });
  });

  suite(`Get subscription order by id`, () => {
    test(`Should error get subscription order by id`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const queryError = new Error('Query error');
      testObj.postgresDb.query.throws(queryError);

      const [error] = await testObj.orderRepository.getSubscriptionById(inputId);

      testObj.postgresDb.query.should.have.callCount(1);
      expect(error).to.be.an.instanceof(DatabaseExecuteException);
      expect(error).to.have.property('httpCode', 400);
      expect(error).to.have.property('isOperation', false);
      expect(error).to.have.property('errorInfo', queryError);
    });

    test(`Should successfully get subscription order by id and return null`, async () => {
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

      const [error, result] = await testObj.orderRepository.getSubscriptionById(inputId);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.fillSubscriptionModelSpy.should.have.callCount(0);
      expect(error).to.be.a('null');
      expect(result).to.be.a('null');
    });

    test(`Should successfully get subscription order by id and return null`, async () => {
      const inputId = testObj.identifierGenerator.generateId();
      const fetchQuery = {
        get rowCount() {
          return 1;
        },
        get rows() {
          return [
            {
              id: testObj.identifierGenerator.generateId(),
              order_id: testObj.identifierGenerator1.generateId(),
              status: SubscriptionModel.STATUS_ACTIVATED,
              insert_date: '2021-08-23 13:37:50',
              update_date: null,
            },
          ];
        },
      };
      testObj.postgresDb.query.resolves(fetchQuery);
      testObj.dateTime.gregorianDateWithTimezone.returns('date');

      const [error, result] = await testObj.orderRepository.getSubscriptionById(inputId);

      testObj.postgresDb.query.should.have.callCount(1);
      testObj.fillSubscriptionModelSpy.should.have.callCount(1);
      expect(error).to.be.a('null');
      expect(result).to.be.instanceOf(SubscriptionModel).and.includes({
        id: testObj.identifierGenerator.generateId(),
        orderId: testObj.identifierGenerator1.generateId(),
        status: SubscriptionModel.STATUS_ACTIVATED,
        insertDate: 'date',
        updateDate: null,
      });
    });
  });
});
