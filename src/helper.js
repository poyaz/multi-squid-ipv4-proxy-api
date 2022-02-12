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

  const dateTime = new DateTime();

  const urlAccessService = sinon.createStubInstance(IUrlAccessService);

  const userController = new UserController(req, res, userService, dateTime, urlAccessService);

  return {
    userService,
    urlAccessService,
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

  const dateTime = new DateTime();

  const packageController = new PackageController(req, res, packageService, dateTime);

  return {
    packageService,
    packageController,
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

  return { postgresDb, postgresDbClient, identifierGenerator, packageRepository };
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

  const urlAccessService = new UrlAccessService(userService, urlAccessRepository);

  return {
    userService,
    urlAccessRepository,
    urlAccessService,
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

  const dateTime = new DateTime();

  const serverController = new ServerController(req, res, serverService, dateTime);

  return {
    serverService,
    serverController,
  };
}

function fakeAddServerValidationMiddleware(req, res) {
  const AddServerValidationMiddleware = require('~src/api/http/server/middleware/addServerValidationMiddleware');

  const addServerValidationMiddleware = new AddServerValidationMiddleware(req, res);

  return { addServerValidationMiddleware };
}

function fakeAppendIpRangeValidationMiddleware(req, res) {
  const AppendIpRangeValidationMiddleware = require('~src/api/http/server/middleware/appendIpRangeValidationMiddleware');

  const appendIpRangeValidationMiddleware = new AppendIpRangeValidationMiddleware(req, res);

  return { appendIpRangeValidationMiddleware };
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
  fakeAppendIpRangeValidationMiddleware,
};
