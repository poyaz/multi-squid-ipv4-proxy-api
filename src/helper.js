/**
 * Created by pooya on 8/23/21.
 */

const sinon = require('sinon');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear().toString();
  let month = (d.getMonth() + 1).toString();
  let day = d.getDate().toString();

  if (month.length < 2) {
    month = `0${month}`;
  }
  if (day.length < 2) {
    day = `0${day}`;
  }

  return [year, month, day].join('-');
}

function fakeIdentifierGenerator(type = '') {
  const IdentifierGenerator = require('~src/infrastructure/system/identifierGenerator');

  const identifierGenerator = sinon.createStubInstance(IdentifierGenerator);
  identifierGenerator.generateId = sinon.stub();

  switch (type) {
    case 'error-id':
      identifierGenerator.generateId.returns('99999999-9999-9999-9999-999999999999');
      break;
    case 'fake-id':
      identifierGenerator.generateId.returns('88888888-8888-8888-8888-888888888888');
      break;
    case 'id-1':
      identifierGenerator.generateId.returns('11111111-1111-1111-1111-111111111111');
      break;
    case 'id-2':
      identifierGenerator.generateId.returns('22222222-2222-2222-2222-222222222222');
      break;
    case 'id-3':
      identifierGenerator.generateId.returns('33333333-3333-3333-3333-333333333333');
      break;
    case 'id-4':
      identifierGenerator.generateId.returns('44444444-4444-4444-4444-444444444444');
      break;
    case 'id-5':
      identifierGenerator.generateId.returns('55555555-5555-5555-5555-555555555555');
      break;
    case 'id-6':
      identifierGenerator.generateId.returns('66666666-6666-6666-6666-666666666666');
      break;
    case 'id-7':
      identifierGenerator.generateId.returns('77777777-7777-7777-7777-777777777777');
      break;
    default:
      identifierGenerator.generateId.returns('00000000-0000-0000-0000-000000000000');
  }

  return identifierGenerator;
}

function fakeAddUserValidationMiddleware(req, res) {
  const AddUserValidationMiddleware = require('~src/api/http/user/middleware/addUserValidationMiddleware');

  const addUserValidationMiddleware = new AddUserValidationMiddleware(req, res);

  return { addUserValidationMiddleware };
}

function fakePasswordUserValidationMiddleware(req, res) {
  const ChangePasswordUserValidationMiddleware = require('~src/api/http/user/middleware/changePasswordUserValidationMiddleware');

  const changePasswordUserValidationMiddleware = new ChangePasswordUserValidationMiddleware(
    req,
    res,
  );

  return { changePasswordUserValidationMiddleware };
}

function fakeBlockUrlForUserValidationMiddleware(req, res) {
  const BlockUrlForUserValidationMiddleware = require('~src/api/http/user/middleware/blockUrlForUserValidationMiddleware');

  const blockUrlForUserValidationMiddleware = new BlockUrlForUserValidationMiddleware(req, res);

  return { blockUrlForUserValidationMiddleware };
}

function fakeUserController(req, res) {
  const IUserService = require('~src/core/interface/iUserService');
  const DateTime = require('~src/infrastructure/system/dateTime');
  const IUrlAccessService = require('~src/core/interface/iUrlAccessService');
  const UserController = require('~src/api/http/user/controller/userController');

  const userService = sinon.createStubInstance(IUserService);

  const findClusterUserService = sinon.createStubInstance(IUserService);

  const dateTime = new DateTime();

  const urlAccessService = sinon.createStubInstance(IUrlAccessService);

  const jwt = {
    sign: sinon.stub(),
  };

  const userController = new UserController(
    req,
    res,
    userService,
    findClusterUserService,
    dateTime,
    urlAccessService,
    jwt,
  );

  return {
    userService,
    findClusterUserService,
    urlAccessService,
    jwt,
    userController,
  };
}

function fakeUserService() {
  const IUserRepository = require('~src/core/interface/iUserRepository');
  const IPackageRepository = require('~src/core/interface/iPackageRepository');
  const IProxyServerRepository = require('~src/core/interface/iProxyServerRepository');
  const UserService = require('~src/core/service/userService');

  const userRepository = sinon.createStubInstance(IUserRepository);

  const userSquidRepository = sinon.createStubInstance(IUserRepository);

  const packageFileRepository = sinon.createStubInstance(IPackageRepository);

  const proxySquidRepository = sinon.createStubInstance(IProxyServerRepository);

  const userService = new UserService(
    userRepository,
    userSquidRepository,
    packageFileRepository,
    proxySquidRepository,
  );

  return {
    userRepository,
    userSquidRepository,
    packageFileRepository,
    proxySquidRepository,
    userService,
  };
}

function fakeUserPgRepository() {
  const DateTime = require('~src/infrastructure/system/dateTime');
  const IIdentifierGenerator = require('~src/core/interface/iIdentifierGenerator');
  const UserPgRepository = require('~src/infrastructure/database/userPgRepository');

  const postgresDb = {};
  postgresDb.query = sinon.stub();

  const identifierGenerator = sinon.createStubInstance(IIdentifierGenerator);

  const dateTime = new DateTime();

  const userRepository = new UserPgRepository(postgresDb, dateTime, identifierGenerator);

  return { postgresDb, identifierGenerator, userRepository };
}

function fakeUserSquidRepository() {
  const UserSquidRepository = require('~src/infrastructure/system/userSquidRepository');

  const userSquidRepository = new UserSquidRepository('passwd-path');

  return { userSquidRepository };
}

function fakeCreatePackageValidationMiddleware(req, res) {
  const CreatePackageValidationMiddleware = require('~src/api/http/package/middleware/createPackageValidationMiddleware');

  const createPackageValidationMiddleware = new CreatePackageValidationMiddleware(req, res);

  return { createPackageValidationMiddleware };
}

function fakeRenewPackageValidationMiddleware(req, res) {
  const RenewPackageValidatorMiddleware = require('~src/api/http/package/middleware/renewPackageValidatorMiddleware');

  const renewPackageValidatorMiddleware = new RenewPackageValidatorMiddleware(req, res);

  return { renewPackageValidatorMiddleware };
}

function fakePackageController(req, res) {
  const IPackageService = require('~src/core/interface/iPackageService');
  const DateTime = require('~src/infrastructure/system/dateTime');
  const PackageController = require('~src/api/http/package/controller/packageController');

  const packageService = sinon.createStubInstance(IPackageService);
  const findClusterPackageService = sinon.createStubInstance(IPackageService);

  const dateTime = new DateTime();

  const packageController = new PackageController(
    req,
    res,
    packageService,
    findClusterPackageService,
    dateTime,
  );

  return {
    packageService,
    findClusterPackageService,
    packageController,
  };
}

function fakeProductService() {
  const IProductRepository = require('~src/core/interface/iProductRepository');
  const ProductService = require('~src/core/service/productService');

  const productRepository = sinon.createStubInstance(IProductRepository);

  const productService = new ProductService(productRepository);

  return {
    productRepository,
    productService,
  };
}

function fakePackagePgRepository() {
  const DateTime = require('~src/infrastructure/system/dateTime');
  const IIdentifierGenerator = require('~src/core/interface/iIdentifierGenerator');
  const PackagePgRepository = require('~src/infrastructure/database/packagePgRepository');

  const postgresDbClient = {
    query: sinon.stub(),
    release: sinon.stub(),
  };

  const postgresDb = {};
  postgresDb.query = sinon.stub();
  postgresDb.connect = sinon.stub().resolves(postgresDbClient);

  const identifierGenerator = sinon.createStubInstance(IIdentifierGenerator);

  const dateTime = new DateTime();

  const packageRepository = new PackagePgRepository(postgresDb, dateTime, identifierGenerator);

  return { postgresDb, postgresDbClient, identifierGenerator, dateTime, packageRepository };
}

function fakePackageFileRepository() {
  const PackageFileRepository = require('~src/infrastructure/system/packageFileRepository');

  const packageFileRepository = new PackageFileRepository('user-ip-path');

  return { packageFileRepository };
}

function fakeUrlAccessService() {
  const IUserService = require('~src/core/interface/iUserService');
  const IUrlAccessRepository = require('~src/core/interface/iUrlAccessRepository');
  const UrlAccessService = require('~src/core/service/urlAccessService');

  const userService = sinon.createStubInstance(IUserService);

  const urlAccessRepository = sinon.createStubInstance(IUrlAccessRepository);

  const urlAccessService = new UrlAccessService(userService, urlAccessRepository, true);

  const urlAccessServiceEnableCheckUrl = new UrlAccessService(
    userService,
    urlAccessRepository,
    true,
  );
  const urlAccessServiceDisableCheckUrl = new UrlAccessService(
    userService,
    urlAccessRepository,
    false,
  );

  return {
    userService,
    urlAccessRepository,
    urlAccessService,
    urlAccessServiceEnableCheckUrl,
    urlAccessServiceDisableCheckUrl,
  };
}

function fakeUrlAccessPgRepository() {
  const DateTime = require('~src/infrastructure/system/dateTime');
  const IIdentifierGenerator = require('~src/core/interface/iIdentifierGenerator');
  const UrlAccessPgRepository = require('~src/infrastructure/database/urlAccessPgRepository');

  const postgresDb = {};
  postgresDb.query = sinon.stub();

  const identifierGenerator = sinon.createStubInstance(IIdentifierGenerator);

  const dateTime = new DateTime();

  const urlAccessPgRepository = new UrlAccessPgRepository(
    postgresDb,
    dateTime,
    identifierGenerator,
  );

  return { postgresDb, identifierGenerator, urlAccessPgRepository };
}

function fakeGenerateProxyValidationMiddleware(req, res) {
  const GenerateProxyValidatorMiddleware = require('~src/api/http/proxy/middleware/generateProxyValidatorMiddleware');

  const generateProxyValidatorMiddleware = new GenerateProxyValidatorMiddleware(req, res);

  return { generateProxyValidatorMiddleware };
}

function fakeDeleteProxyIpValidationMiddleware(req, res) {
  const DeleteProxyIpValidatorMiddleware = require('~src/api/http/proxy/middleware/deleteProxyIpValidatorMiddleware');

  const deleteProxyIpValidatorMiddleware = new DeleteProxyIpValidatorMiddleware(req, res);

  return { deleteProxyIpValidatorMiddleware };
}

function fakeProxyController(req, res) {
  const IProxyServerService = require('~src/core/interface/iProxyServerService');
  const DateTime = require('~src/infrastructure/system/dateTime');
  const ProxyController = require('~src/api/http/proxy/controller/proxyController');

  const proxyServerService = sinon.createStubInstance(IProxyServerService);

  const dateTime = new DateTime();

  const proxyController = new ProxyController(req, res, proxyServerService, dateTime);

  return {
    proxyServerService,
    proxyController,
  };
}

function fakeProxyServerService() {
  const IProxyServerRepository = require('~src/core/interface/iProxyServerRepository');
  const IJobService = require('~src/core/interface/iJobService');
  const ProxyServerService = require('~src/core/service/proxyServerService');

  const proxyServerRepository = sinon.createStubInstance(IProxyServerRepository);

  const proxyServerJobService = sinon.createStubInstance(IJobService);

  const proxySquidRepository = sinon.createStubInstance(IProxyServerRepository);

  const proxyServerRegenerateJobService = sinon.createStubInstance(IJobService);

  const proxyServerService = new ProxyServerService(
    proxyServerRepository,
    proxyServerJobService,
    proxySquidRepository,
    proxyServerRegenerateJobService,
  );

  return {
    proxyServerRepository,
    proxyServerJobService,
    proxySquidRepository,
    proxyServerRegenerateJobService,
    proxyServerService,
  };
}

function fakeProxyServerJobService() {
  const IJobRepository = require('~src/core/interface/iJobRepository');
  const IProxyServerRepository = require('~src/core/interface/iProxyServerRepository');
  const ProxyServerJobService = require('~src/core/service/proxyServerJobService');

  const jobRepository = sinon.createStubInstance(IJobRepository);

  const proxyServerRepository = sinon.createStubInstance(IProxyServerRepository);

  const proxyServerFileRepository = sinon.createStubInstance(IProxyServerRepository);

  const ipAddrRepository = sinon.createStubInstance(IProxyServerRepository);

  const proxyServerJobService = new ProxyServerJobService(
    jobRepository,
    proxyServerRepository,
    proxyServerFileRepository,
    ipAddrRepository,
  );

  return {
    jobRepository,
    proxyServerRepository,
    proxyServerFileRepository,
    ipAddrRepository,
    proxyServerJobService,
  };
}

function fakeProxyRegenerateServerJobService() {
  const IJobRepository = require('~src/core/interface/iJobRepository');
  const IProxyServerRepository = require('~src/core/interface/iProxyServerRepository');
  const ProxyServerRegenerateJobService = require('~src/core/service/proxyServerRegenerateJobService');

  const jobRepository = sinon.createStubInstance(IJobRepository);

  const proxyServerRepository = sinon.createStubInstance(IProxyServerRepository);

  const proxyServerFileRepository = sinon.createStubInstance(IProxyServerRepository);

  const proxyServerRegenerateJobService = new ProxyServerRegenerateJobService(
    jobRepository,
    proxyServerRepository,
    proxyServerFileRepository,
  );

  return {
    jobRepository,
    proxyServerRepository,
    proxyServerFileRepository,
    proxyServerRegenerateJobService,
  };
}

function fakeProxyServerPgRepository() {
  const DateTime = require('~src/infrastructure/system/dateTime');
  const IIdentifierGenerator = require('~src/core/interface/iIdentifierGenerator');
  const ProxyServerRepository = require('~src/infrastructure/database/proxyServerRepository');

  const postgresDb = {};
  postgresDb.query = sinon.stub();

  const identifierGenerator = sinon.createStubInstance(IIdentifierGenerator);

  const dateTime = new DateTime();

  const proxyServerRepository = new ProxyServerRepository(
    postgresDb,
    dateTime,
    identifierGenerator,
  );

  return { postgresDb, identifierGenerator, proxyServerRepository };
}

function fakeProxyFileServerPgRepository(ipCountPerInstance) {
  const Docker = require('dockerode');
  const SquidServerRepository = require('~src/infrastructure/system/squidServerRepository');

  const defaultSquidConfigFolder = '/tmp/config';
  const projectPath = {
    host: '/opt/project',
    current: '/home/node/project',
  };
  const squidPasswordFile = 'storage/template/squid/squid-pwd.htpasswd';
  const squidIpAccessFile = 'storage/template/squid/squid-user-ip.conf';
  const squidIpAccessBashFile = 'storage/scripts/squid-block-domain.sh';
  const squidVolumePerInstanceFolder = '/tmp/squid';
  const apiUrl = 'http://127.0.0.1:3000';
  const apiToken = 'Bearer my-token';

  const docker = sinon.createStubInstance(Docker);
  const container = sinon.createStubInstance(Docker.Container);

  const squidServerRepository = new SquidServerRepository(
    docker,
    projectPath,
    defaultSquidConfigFolder,
    squidPasswordFile,
    squidIpAccessFile,
    squidIpAccessBashFile,
    squidVolumePerInstanceFolder,
    ipCountPerInstance,
    apiUrl,
    apiToken,
  );

  return { docker, container, squidServerRepository };
}

function fakeIpAddrRepository() {
  const IpAddrRepository = require('~src/infrastructure/system/ipAddrRepository');

  const ipAddrRepository = new IpAddrRepository();

  return { ipAddrRepository };
}

function fakeJobPgRepository() {
  const DateTime = require('~src/infrastructure/system/dateTime');
  const IIdentifierGenerator = require('~src/core/interface/iIdentifierGenerator');
  const JobRepository = require('~src/infrastructure/database/jobRepository');

  const postgresDb = {};
  postgresDb.query = sinon.stub();

  const identifierGenerator = sinon.createStubInstance(IIdentifierGenerator);

  const dateTime = new DateTime();

  const jobRepository = new JobRepository(postgresDb, dateTime, identifierGenerator);

  return { postgresDb, identifierGenerator, jobRepository };
}

function fakeJobController(req, res) {
  const IJobService = require('~src/core/interface/iJobService');
  const DateTime = require('~src/infrastructure/system/dateTime');
  const JobController = require('~src/api/http/job/controller/jobController');

  const jobService = sinon.createStubInstance(IJobService);

  const dateTime = new DateTime();

  const jobController = new JobController(req, res, jobService, dateTime);

  return {
    jobService,
    jobController,
  };
}

function fakeJobService() {
  const IJobRepository = require('~src/core/interface/iJobRepository');
  const JobService = require('~src/core/service/jobService');

  const jobRepository = sinon.createStubInstance(IJobRepository);

  const jobService = new JobService(jobRepository);

  return {
    jobRepository,
    jobService,
  };
}

function fakeServerController(req, res) {
  const IServerService = require('~src/core/interface/iServerService');
  const DateTime = require('~src/infrastructure/system/dateTime');
  const ServerController = require('~src/api/http/server/controller/serverController');

  const serverService = sinon.createStubInstance(IServerService);
  const findClusterServerService = sinon.createStubInstance(IServerService);

  const dateTime = new DateTime();

  const serverController = new ServerController(
    req,
    res,
    serverService,
    findClusterServerService,
    dateTime,
  );

  return {
    serverService,
    findClusterServerService,
    serverController,
  };
}

function fakeAddServerValidationMiddleware(req, res) {
  const AddServerValidationMiddleware = require('~src/api/http/server/middleware/addServerValidationMiddleware');

  const addServerValidationMiddleware = new AddServerValidationMiddleware(req, res);

  return { addServerValidationMiddleware };
}

function fakeUpdateServerValidationMiddleware(req, res) {
  const UpdateServerValidationMiddleware = require('~src/api/http/server/middleware/updateServerValidationMiddleware');

  const updateServerValidationMiddleware = new UpdateServerValidationMiddleware(req, res);

  return { updateServerValidationMiddleware };
}

function fakeServerService(currentInstanceIp, otherInstanceIp) {
  const IServerRepository = require('~src/core/interface/iServerRepository');
  const ServerService = require('~src/core/service/serverService');

  const serverRepository = sinon.createStubInstance(IServerRepository);

  const serverService = new ServerService(serverRepository, currentInstanceIp);

  const otherServerService = new ServerService(serverRepository, otherInstanceIp);

  return {
    serverRepository,
    serverService,
    otherServerService,
  };
}

function fakeServerPgRepository() {
  const DateTime = require('~src/infrastructure/system/dateTime');
  const IIdentifierGenerator = require('~src/core/interface/iIdentifierGenerator');
  const ServerRepository = require('~src/infrastructure/database/serverRepository');

  const postgresDb = {};
  postgresDb.query = sinon.stub();

  const identifierGenerator = sinon.createStubInstance(IIdentifierGenerator);

  const dateTime = new DateTime();

  const serverRepository = new ServerRepository(postgresDb, dateTime, identifierGenerator);

  return { postgresDb, identifierGenerator, serverRepository };
}

function fakeFindClusterProxyServerService() {
  const IProxyServerService = require('~src/core/interface/iProxyServerService');
  const IServerService = require('~src/core/interface/iServerService');
  const IServerApiRepository = require('~src/core/interface/iServerApiRepository');
  const FindClusterProxyServerService = require('~src/core/service/findClusterProxyServerService');

  const proxyServerService = sinon.createStubInstance(IProxyServerService);

  const serverService = sinon.createStubInstance(IServerService);

  const serverApiRepository = sinon.createStubInstance(IServerApiRepository);

  const findClusterProxyServerService = new FindClusterProxyServerService(
    proxyServerService,
    serverService,
    serverApiRepository,
  );

  return {
    proxyServerService,
    serverService,
    serverApiRepository,
    findClusterProxyServerService,
  };
}

function fakeFindClusterPackageService(currentInstanceIp) {
  const IPackageService = require('~src/core/interface/iPackageService');
  const IServerService = require('~src/core/interface/iServerService');
  const IServerApiRepository = require('~src/core/interface/iServerApiRepository');
  const FindClusterPackageService = require('~src/core/service/findClusterPackageService');

  const packageService = sinon.createStubInstance(IPackageService);

  const serverService = sinon.createStubInstance(IServerService);

  const serverApiRepository = sinon.createStubInstance(IServerApiRepository);

  const findClusterPackageService = new FindClusterPackageService(
    packageService,
    serverService,
    serverApiRepository,
    currentInstanceIp,
  );

  return {
    packageService,
    serverService,
    serverApiRepository,
    findClusterPackageService,
  };
}

function fakeProxyServerApiRepository() {
  const ProxyServerApiRepository = require('~src/infrastructure/api/proxyServerApiRepository');
  const IDateTime = require('~src/core/interface/iDateTime');

  const dateTime = sinon.createStubInstance(IDateTime);

  const proxyServerApiRepository = new ProxyServerApiRepository(dateTime, 'Bearer token');

  return { dateTime, proxyServerApiRepository };
}

function fakeFindClusterUserService(currentInstanceIp) {
  const IUserService = require('~src/core/interface/iUserService');
  const IServerService = require('~src/core/interface/iServerService');
  const IServerApiRepository = require('~src/core/interface/iServerApiRepository');
  const FindClusterUserService = require('~src/core/service/findClusterUserService');

  const userService = sinon.createStubInstance(IUserService);

  const serverService = sinon.createStubInstance(IServerService);

  const serverApiRepository = sinon.createStubInstance(IServerApiRepository);

  const findClusterUserService = new FindClusterUserService(
    userService,
    serverService,
    serverApiRepository,
    currentInstanceIp,
  );

  return {
    userService,
    serverService,
    serverApiRepository,
    findClusterUserService,
  };
}

function fakeOauthController(req, res) {
  const IExternalAuthService = require('~src/core/interface/iExternalAuthService');
  const OauthController = require('~src/api/http/oauth/controller/oauthController');

  const externalAuthService = sinon.createStubInstance(IExternalAuthService);

  const jwt = {
    sign: sinon.stub(),
  };

  const oauthController = new OauthController(req, res, externalAuthService, jwt);

  return {
    jwt,
    externalAuthService,
    oauthController,
  };
}

function fakeDiscordExternalAuthService(clientId, redirectUrl, cdnUrl) {
  const IUserService = require('~src/core/interface/iUserService');
  const DiscordExternalAuthService = require('~src/core/service/discordExternalAuthService');

  const externalAuth = {
    platform: 'discord',
    config: {
      id: clientId,
      redirectUrl,
      cdnUrl,
    },
    auth: {
      generateAuthUrl: sinon.stub(),
      tokenRequest: sinon.stub(),
      getUser: sinon.stub(),
    },
  };
  const userService = sinon.createStubInstance(IUserService);

  const discordExternalAuthService = new DiscordExternalAuthService(externalAuth, userService);

  return {
    userService,
    externalAuth: externalAuth.auth,
    discordExternalAuthService,
  };
}

function fakeFindClusterServerService(currentInstanceIp) {
  const IServerService = require('~src/core/interface/iServerService');
  const IServerApiRepository = require('~src/core/interface/iServerApiRepository');
  const FindClusterServerService = require('~src/core/service/findClusterServerService');

  const serverService = sinon.createStubInstance(IServerService);

  const serverApiRepository = sinon.createStubInstance(IServerApiRepository);

  const findClusterServerService = new FindClusterServerService(
    serverService,
    serverApiRepository,
    currentInstanceIp,
  );

  return {
    serverService,
    serverApiRepository,
    findClusterServerService,
  };
}

function fakeProductController(req, res) {
  const IProductService = require('~src/core/interface/iProductService');
  const IDateTime = require('~src/core/interface/iDateTime');
  const ProductController = require('~src/api/http/product/controller/productController');

  const productService = sinon.createStubInstance(IProductService);

  const dateTime = sinon.createStubInstance(IDateTime);

  const productController = new ProductController(req, res, productService, dateTime);

  return {
    productService,
    dateTime,
    productController,
  };
}

function fakePackageService() {
  const IUserService = require('~src/core/interface/iUserService');
  const IPackageRepository = require('~src/core/interface/iPackageRepository');
  const IProxyServerRepository = require('~src/core/interface/iProxyServerRepository');
  const PackageService = require('~src/core/service/packageService');

  const userService = sinon.createStubInstance(IUserService);

  const packageRepository = sinon.createStubInstance(IPackageRepository);

  const packageFileRepository = sinon.createStubInstance(IPackageRepository);

  const proxySquidRepository = sinon.createStubInstance(IProxyServerRepository);

  const packageService = new PackageService(
    userService,
    packageRepository,
    packageFileRepository,
    proxySquidRepository,
  );

  return {
    userService,
    packageRepository,
    packageFileRepository,
    proxySquidRepository,
    packageService,
  };
}

function fakeProductPgRepository() {
  const IDateTime = require('~src/core/interface/iDateTime');
  const IIdentifierGenerator = require('~src/core/interface/iIdentifierGenerator');
  const ProductPgRepository = require('~src/infrastructure/database/productPgRepository');

  const postgresDbClient = {
    query: sinon.stub(),
    release: sinon.stub(),
  };

  const postgresDb = {};
  postgresDb.query = sinon.stub();
  postgresDb.connect = sinon.stub().resolves(postgresDbClient);

  const dateTime = sinon.createStubInstance(IDateTime);

  const identifierGenerator = sinon.createStubInstance(IIdentifierGenerator);

  const productRepository = new ProductPgRepository(postgresDb, dateTime, identifierGenerator);

  return { postgresDb, postgresDbClient, dateTime, identifierGenerator, productRepository };
}

function fakeOrderController(req, res) {
  const IOrderService = require('~src/core/interface/iOrderService');
  const IOrderParserService = require('~src/core/interface/iOrderParserService');
  const IDateTime = require('~src/core/interface/iDateTime');
  const OrderController = require('~src/api/http/order/controller/orderController');

  const orderService = sinon.createStubInstance(IOrderService);
  const orderParserService = sinon.createStubInstance(IOrderParserService);

  const dateTime = sinon.createStubInstance(IDateTime);

  const orderController = new OrderController(req, res, orderService, orderParserService, dateTime);

  return {
    orderService,
    orderParserService,
    dateTime,
    orderController,
  };
}

function fakeOrderService() {
  const IProductService = require('~src/core/interface/iProductService');
  const IPackageService = require('~src/core/interface/iPackageService');
  const IOrderRepository = require('~src/core/interface/iOrderRepository');
  const OrderService = require('~src/core/service/orderService');

  const productService = sinon.createStubInstance(IProductService);

  const packageService = sinon.createStubInstance(IPackageService);

  const orderRepository = sinon.createStubInstance(IOrderRepository);

  const orderService = new OrderService(productService, packageService, orderRepository);

  return {
    productService,
    packageService,
    orderRepository,
    orderService,
  };
}

function fakeOrderPgRepository() {
  const IDateTime = require('~src/core/interface/iDateTime');
  const IIdentifierGenerator = require('~src/core/interface/iIdentifierGenerator');
  const OrderPgRepository = require('~src/infrastructure/database/orderPgRepository');

  const postgresDbClient = {
    query: sinon.stub(),
    release: sinon.stub(),
  };

  const postgresDb = {};
  postgresDb.query = sinon.stub();
  postgresDb.connect = sinon.stub().resolves(postgresDbClient);

  const dateTime = sinon.createStubInstance(IDateTime);

  const identifierGenerator = sinon.createStubInstance(IIdentifierGenerator);

  const orderRepository = new OrderPgRepository(postgresDb, dateTime, identifierGenerator);

  return { postgresDb, postgresDbClient, dateTime, identifierGenerator, orderRepository };
}

function fakeOrderFastspringApiRepository() {
  const IOrderRepository = require('~src/core/interface/iOrderRepository');
  const IFastspringApiRepository = require('~src/core/interface/iFastspringApiRepository');
  const OrderFastspringApiRepository = require('~src/infrastructure/api/orderFastspringApiRepository');

  const orderRepository = sinon.createStubInstance(IOrderRepository);

  const fastspringApiRepository = sinon.createStubInstance(IFastspringApiRepository);

  const orderFastspringApiRepository = new OrderFastspringApiRepository(
    orderRepository,
    fastspringApiRepository,
  );

  return { orderRepository, fastspringApiRepository, orderFastspringApiRepository };
}

function fakeFastspringOrderParse() {
  const IPackageService = require('~src/core/interface/iPackageService');
  const IOrderService = require('~src/core/interface/iOrderService');
  const IOrderRepository = require('~src/core/interface/iOrderRepository');
  const IFastspringApiRepository = require('~src/core/interface/iFastspringApiRepository');
  const IPaymentService = require('~src/core/interface/iPaymentService');
  const FastspringOrderParse = require('~src/core/service/fastspringOrderParse');

  const packageService = sinon.createStubInstance(IPackageService);

  const orderService = sinon.createStubInstance(IOrderService);

  const orderRepository = sinon.createStubInstance(IOrderRepository);

  const fastspringApiRepository = sinon.createStubInstance(IFastspringApiRepository);

  const paymentService = sinon.createStubInstance(IPaymentService);

  const fastspringOrderParse = new FastspringOrderParse(
    packageService,
    orderService,
    orderRepository,
    fastspringApiRepository,
    paymentService,
  );

  return {
    packageService,
    orderService,
    orderRepository,
    fastspringApiRepository,
    paymentService,
    fastspringOrderParse,
  };
}

function fakeFastspringPackageService() {
  const IPackageService = require('~src/core/interface/iPackageService');
  const IPackageRepository = require('~src/core/interface/iPackageRepository');
  const IOrderRepository = require('~src/core/interface/iOrderRepository');
  const IFastspringApiRepository = require('~src/core/interface/iFastspringApiRepository');
  const FastspringPackageService = require('~src/core/service/fastspringPackageService');

  const packageService = sinon.createStubInstance(IPackageService);

  const packageRepository = sinon.createStubInstance(IPackageRepository);

  const orderRepository = sinon.createStubInstance(IOrderRepository);

  const fastspringApiRepository = sinon.createStubInstance(IFastspringApiRepository);

  const fastspringPackageService = new FastspringPackageService(
    packageService,
    packageRepository,
    orderRepository,
    fastspringApiRepository,
  );

  return {
    packageService,
    packageRepository,
    orderRepository,
    fastspringApiRepository,
    fastspringPackageService,
  };
}

function fakeFastspringApiRepository() {
  const IPaymentService = require('~src/core/interface/iPaymentService');
  const FastspringApiRepository = require('~src/infrastructure/api/fastspringApiRepository');

  const paymentService = sinon.createStubInstance(IPaymentService);

  const fastspringApiRepository = new FastspringApiRepository(
    paymentService,
    'username',
    'password',
    'https://example.com',
  );

  return { paymentService, fastspringApiRepository };
}

function fakeExternalProductApiRepository() {
  const IProductRepository = require('~src/core/interface/iProductRepository');
  const IFastspringApiRepository = require('~src/core/interface/iFastspringApiRepository');
  const ExternalProductApiRepository = require('~src/infrastructure/api/externalProductApiRepository');

  const productRepository = sinon.createStubInstance(IProductRepository);

  const fastspringApiRepository = sinon.createStubInstance(IFastspringApiRepository);

  const externalProductApiRepository = new ExternalProductApiRepository(
    productRepository,
    fastspringApiRepository,
  );

  return { productRepository, fastspringApiRepository, externalProductApiRepository };
}

function fakePaymentController(req, res) {
  const IPaymentService = require('~src/core/interface/iPaymentService');
  const PaymentController = require('~src/api/http/payment/controller/paymentController');

  const paymentService = sinon.createStubInstance(IPaymentService);

  const paymentController = new PaymentController(req, res, paymentService);

  return {
    paymentService,
    paymentController,
  };
}

function fakePaymentService() {
  const PaymentService = require('~src/core/service/paymentService');

  const packageServiceDisable = new PaymentService(false, '');
  const packageServiceEnableEmpty = new PaymentService(true, '');
  const packageServiceEnable = new PaymentService(true, 'test.fastspring.com');

  return { packageServiceDisable, packageServiceEnableEmpty, packageServiceEnable };
}

function fakeAclService() {
  const IPackageRepository = require('~src/core/interface/iPackageRepository');
  const IOrderRepository = require('~src/core/interface/iOrderRepository');
  const AclService = require('~src/core/service/aclService');

  const packageRepository = sinon.createStubInstance(IPackageRepository);

  const orderRepository = sinon.createStubInstance(IOrderRepository);

  const aclService = new AclService(packageRepository, orderRepository);

  return {
    packageRepository,
    orderRepository,
    aclService,
  };
}

function fakeSyncService() {
  const ISyncRepository = require('~src/core/interface/iSyncRepository');
  const IPackageService = require('~src/core/interface/iPackageService');
  const IUserService = require('~src/core/interface/iUserService');
  const SyncService = require('~src/core/service/syncService');

  const syncRepository = sinon.createStubInstance(ISyncRepository);

  const packageService = sinon.createStubInstance(IPackageService);

  const userService = sinon.createStubInstance(IUserService);

  const syncService = new SyncService(syncRepository, packageService, userService);

  return {
    syncRepository,
    packageService,
    userService,
    syncService,
  };
}

function fakeSyncPgRepository() {
  const IDateTime = require('~src/core/interface/iDateTime');
  const IIdentifierGenerator = require('~src/core/interface/iIdentifierGenerator');
  const SyncPgRepository = require('~src/infrastructure/database/syncPgRepository');

  const postgresDb = {};
  postgresDb.query = sinon.stub();

  const identifierGenerator = sinon.createStubInstance(IIdentifierGenerator);

  const dateTime = sinon.createStubInstance(IDateTime);

  const syncRepository = new SyncPgRepository(postgresDb, dateTime, identifierGenerator);

  return { postgresDb, dateTime, identifierGenerator, syncRepository };
}

module.exports = {
  sleep,
  formatDate,
  fakeIdentifierGenerator,
  fakeAddUserValidationMiddleware,
  fakePasswordUserValidationMiddleware,
  fakeBlockUrlForUserValidationMiddleware,
  fakeUserController,
  fakeUserService,
  fakeUserPgRepository,
  fakeUserSquidRepository,
  fakeCreatePackageValidationMiddleware,
  fakeRenewPackageValidationMiddleware,
  fakePackageController,
  fakePackageService,
  fakePackagePgRepository,
  fakePackageFileRepository,
  fakeUrlAccessService,
  fakeUrlAccessPgRepository,
  fakeGenerateProxyValidationMiddleware,
  fakeDeleteProxyIpValidationMiddleware,
  fakeProxyController,
  fakeProxyServerService,
  fakeProxyServerJobService,
  fakeProxyRegenerateServerJobService,
  fakeProxyServerPgRepository,
  fakeProxyFileServerPgRepository,
  fakeIpAddrRepository,
  fakeJobPgRepository,
  fakeJobController,
  fakeJobService,
  fakeServerController,
  fakeAddServerValidationMiddleware,
  fakeUpdateServerValidationMiddleware,
  fakeServerService,
  fakeServerPgRepository,
  fakeFindClusterProxyServerService,
  fakeFindClusterPackageService,
  fakeProxyServerApiRepository,
  fakeFindClusterUserService,
  fakeOauthController,
  fakeDiscordExternalAuthService,
  fakeFindClusterServerService,
  fakeProductController,
  fakeProductService,
  fakeProductPgRepository,
  fakeOrderController,
  fakeOrderService,
  fakeOrderPgRepository,
  fakeOrderFastspringApiRepository,
  fakeFastspringOrderParse,
  fakeFastspringPackageService,
  fakeFastspringApiRepository,
  fakeExternalProductApiRepository,
  fakePaymentController,
  fakePaymentService,
  fakeAclService,
  fakeSyncService,
  fakeSyncPgRepository,
};
