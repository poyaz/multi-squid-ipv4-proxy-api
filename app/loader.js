/**
 * Created by pooya on 8/29/21.
 */

const os = require('os');
const cluster = require('cluster');
const Config = require('~config');

const ExpressApi = require('./bootstrap/api/expressApi');
const CliApi = require('./bootstrap/api/cliApi');
const CronjobApi = require('./bootstrap/api/cronjobApi');
const PgDb = require('./bootstrap/db/pgDb');
const FileUtil = require('./bootstrap/util/fileUtil');
const JwtUtil = require('./bootstrap/util/jwtUtil');
const DockerUtil = require('./bootstrap/util/dockerUtil');
const ApiCluster = require('./bootstrap/util/apiCluster');
const DiscordOauth = require('./bootstrap/oauth/discordOauth');

const DateTime = require('~src/infrastructure/system/dateTime');
const IdentifierGenerator = require('~src/infrastructure/system/identifierGenerator');

const JobRepository = require('~src/infrastructure/database/jobRepository');
const PackagePgRepository = require('~src/infrastructure/database/packagePgRepository');
const ProxyServerRepository = require('~src/infrastructure/database/proxyServerRepository');
const ServerRepository = require('~src/infrastructure/database/serverRepository');
const UrlAccessPgRepository = require('~src/infrastructure/database/urlAccessPgRepository');
const UserPgRepository = require('~src/infrastructure/database/userPgRepository');

const IpAddrRepository = require('~src/infrastructure/system/ipAddrRepository');
const PackageFileRepository = require('~src/infrastructure/system/packageFileRepository');
const SquidServerRepository = require('~src/infrastructure/system/squidServerRepository');
const UserSquidRepository = require('~src/infrastructure/system/userSquidRepository');

const ProxyServerApiRepository = require('~src/infrastructure/api/proxyServerApiRepository');

const DiscordExternalAuthService = require('~src/core/service/discordExternalAuthService');
const FindClusterPackageService = require('~src/core/service/findClusterPackageService');
const FindClusterProxyServerService = require('~src/core/service/findClusterProxyServerService');
const FindClusterServerService = require('~src/core/service/findClusterServerService');
const FindClusterUserService = require('~src/core/service/findClusterUserService');
const JobService = require('~src/core/service/jobService');
const PackageService = require('~src/core/service/packageService');
const ProxyServerJobService = require('~src/core/service/proxyServerJobService');
const ProxyServerRegenerateJobService = require('~src/core/service/proxyServerRegenerateJobService');
const ProxyServerService = require('~src/core/service/proxyServerService');
const ServerService = require('~src/core/service/serverService');
const UrlAccessService = require('~src/core/service/urlAccessService');
const UserService = require('~src/core/service/userService');

const AccessMiddlewareFactory = require('~src/api/http/accessMiddlewareFactory');
const RoleAccessMiddlewareFactory = require('~src/api/http/roleAccessMiddlewareFactory');

const JobControllerFactory = require('~src/api/http/job/controller/jobControllerFactory');

const OauthControllerFactory = require('~src/api/http/oauth/controller/oauthControllerFactory');

const CreatePackageValidationMiddlewareFactory = require('~src/api/http/package/middleware/createPackageValidationMiddlewareFactory');
const RenewPackageValidatorMiddlewareFactory = require('~src/api/http/package/middleware/renewPackageValidatorMiddlewareFactory');
const PackageControllerFactory = require('~src/api/http/package/controller/packageControllerFactory');

const DeleteProxyIpValidatorMiddlewareFactory = require('~src/api/http/proxy/middleware/deleteProxyIpValidatorMiddlewareFactory');
const GenerateProxyValidatorMiddlewareFactory = require('~src/api/http/proxy/middleware/generateProxyValidatorMiddlewareFactory');
const ProxyControllerFactory = require('~src/api/http/proxy/controller/proxyControllerFactory');

const AddUserValidationMiddlewareFactory = require('~src/api/http/user/middleware/addUserValidationMiddlewareFactory');
const BlockUrlForUserValidationMiddlewareFactory = require('~src/api/http/user/middleware/blockUrlForUserValidationMiddlewareFactory');
const ChangePasswordUserValidationMiddlewareFactory = require('~src/api/http/user/middleware/changePasswordUserValidationMiddlewareFactory');
const SelfUserAccessMiddlewareFactory = require('~src/api/http/user/middleware/selfUserAccessMiddlewareFactory');
const UserControllerFactory = require('~src/api/http/user/controller/userControllerFactory');

const AddServerValidationMiddlewareFactory = require('~src/api/http/server/middleware/addServerValidationMiddlewareFactory');
const UpdateServerValidationMiddlewareFactory = require('~src/api/http/server/middleware/updateServerValidationMiddlewareFactory');
const ServerControllerFactory = require('~src/api/http/server/controller/serverControllerFactory');

const PackageCronjob = require('~src/api/cronjob/packageCronjob');
const ReloadCronjob = require('~src/api/cronjob/reloadCronjob');

class Loader {
  constructor({ cwd = '', name = '', version = '', cli = false } = {}) {
    this._options = {};
    this._options.cwd = cwd;
    this._options.name = name;
    this._options.version = version;
    this._options.cli = cli;
    this._dependency = {};

    this._config = new Config();
  }

  async start() {
    if (!this._options.cli) {
      this._cluster();
    }

    const currentInstanceIp = this._config.getStr('server.host');

    const {
      squidVolumeFolder,
      squidPasswordFile,
      squidIpAccessFile,
      squidIpAccessBashFile,
      squidConfFolder,
    } = await this._fileLocation();
    const { pgDb } = await this._db();
    const { jwt } = await this._jwt();
    const { docker } = await this._docker();
    const { discord } = await this._discord();
    const { apiToken } = await this._apiCluster(jwt);

    const identifierGenerator = new IdentifierGenerator();
    const dateTime = new DateTime(
      this._config.getStr('custom.timezone.locales'),
      this._config.getStr('custom.timezone.zone'),
    );
    const squidCheckBlockUrl = this._config.getBool('custom.squid.checkBlockUrl', false);
    const overrideSquidPort = this._config.getNum('custom.squid.portListener');

    const httpPublicApiHostConfig = this._config.getStr('server.public.host');
    const httpPublicApiPortConfig = this._config.getNum('server.public.http.port');
    const httpApiUrlConfig = `http://${httpPublicApiHostConfig}:${httpPublicApiPortConfig}`;
    const squidPerIpInstanceConfig = this._config.getNum('custom.squid.perIpInstance');
    const squidScriptApiTokenConfig = this._config.getStr('custom.squid.scriptApiToken');
    const realProjectPathForDockerConfig = this._config.getStr('custom.realProjectPathForDocker');
    const projectPathConfig = {
      host: realProjectPathForDockerConfig,
      current: this._options.cwd,
    };
    const oauthHtmlPageConfig = {
      address: this._config.getStr('custom.oauth.htmlPage.address'),
      key: this._config.getStr('custom.oauth.htmlPage.key'),
    };

    // Repository
    // ----------

    const ipAddrRepository = new IpAddrRepository();
    const packageFileRepository = new PackageFileRepository(squidIpAccessFile);
    const squidServerRepository = new SquidServerRepository(
      docker,
      projectPathConfig,
      squidConfFolder,
      squidPasswordFile,
      squidIpAccessFile,
      squidIpAccessBashFile,
      squidVolumeFolder,
      squidPerIpInstanceConfig,
      httpApiUrlConfig,
      squidScriptApiTokenConfig,
      overrideSquidPort,
    );
    const userSquidRepository = new UserSquidRepository(squidPasswordFile);

    const jobRepository = new JobRepository(pgDb, dateTime, identifierGenerator);
    const packagePgRepository = new PackagePgRepository(pgDb, dateTime, identifierGenerator);
    const proxyServerRepository = new ProxyServerRepository(pgDb, dateTime, identifierGenerator);
    const serverRepository = new ServerRepository(pgDb, dateTime, identifierGenerator);
    const urlAccessPgRepository = new UrlAccessPgRepository(pgDb, dateTime, identifierGenerator);
    const userPgRepository = new UserPgRepository(pgDb, dateTime, identifierGenerator);

    const proxyServerApiRepository = new ProxyServerApiRepository(dateTime, apiToken);

    // Service
    // -------

    const jobService = new JobService(jobRepository);
    const userService = new UserService(
      userPgRepository,
      userSquidRepository,
      packageFileRepository,
      squidServerRepository,
    );
    const packageService = new PackageService(
      userService,
      packagePgRepository,
      packageFileRepository,
      squidServerRepository,
    );
    const urlAccessService = new UrlAccessService(
      userService,
      urlAccessPgRepository,
      squidCheckBlockUrl,
    );
    const proxyServerJobService = new ProxyServerJobService(
      jobRepository,
      proxyServerRepository,
      squidServerRepository,
      ipAddrRepository,
    );
    const proxyServerRegenerateJobService = new ProxyServerRegenerateJobService(
      jobRepository,
      proxyServerRepository,
      squidServerRepository,
    );
    const proxyServerService = new ProxyServerService(
      proxyServerRepository,
      proxyServerJobService,
      squidServerRepository,
      proxyServerRegenerateJobService,
    );
    const serverService = new ServerService(serverRepository, currentInstanceIp);
    const findClusterPackageService = new FindClusterPackageService(
      packageService,
      serverService,
      proxyServerApiRepository,
      currentInstanceIp,
    );
    const findClusterProxyServerService = new FindClusterProxyServerService(
      proxyServerService,
      serverService,
      proxyServerApiRepository,
    );
    const findClusterServerService = new FindClusterServerService(
      serverService,
      proxyServerApiRepository,
      currentInstanceIp,
    );
    const findClusterUserService = new FindClusterUserService(
      userService,
      serverService,
      proxyServerApiRepository,
      currentInstanceIp,
    );
    const discordExternalAuthService = new DiscordExternalAuthService(
      discord,
      findClusterUserService,
    );

    // Controller and middleware
    // -------------------------

    const accessMiddlewareFactory = new AccessMiddlewareFactory(jwt);
    const roleAccessMiddlewareFactory = new RoleAccessMiddlewareFactory();

    const jobControllerFactory = new JobControllerFactory(jobService, dateTime);

    const oauthControllerFactory = new OauthControllerFactory(
      discordExternalAuthService,
      jwt,
      oauthHtmlPageConfig,
    );

    const packageMiddlewares = {
      createPackageValidation: new CreatePackageValidationMiddlewareFactory(),
      renewPackageValidator: new RenewPackageValidatorMiddlewareFactory(),
    };
    const packageControllerFactory = new PackageControllerFactory(
      packageService,
      findClusterPackageService,
      dateTime,
    );

    const proxyMiddleware = {
      deleteProxyIpValidation: new DeleteProxyIpValidatorMiddlewareFactory(),
      generateProxyValidation: new GenerateProxyValidatorMiddlewareFactory(),
    };
    const proxyControllerFactory = new ProxyControllerFactory(
      findClusterProxyServerService,
      dateTime,
    );

    const userMiddlewares = {
      addUserValidation: new AddUserValidationMiddlewareFactory(),
      blockUrlForUserValidation: new BlockUrlForUserValidationMiddlewareFactory(),
      changePasswordUserValidation: new ChangePasswordUserValidationMiddlewareFactory(),
      selfUserAccess: new SelfUserAccessMiddlewareFactory(),
    };
    const userControllerFactory = new UserControllerFactory(
      userService,
      findClusterUserService,
      dateTime,
      urlAccessService,
      jwt,
    );

    const serverMiddlewares = {
      addServerValidation: new AddServerValidationMiddlewareFactory(),
      updateServerValidation: new UpdateServerValidationMiddlewareFactory(),
    };
    const serverControllerFactory = new ServerControllerFactory(
      serverService,
      findClusterServerService,
      dateTime,
    );

    // Other API
    // --------------------------

    const packageCronjob = new PackageCronjob(findClusterPackageService);
    const reloadCronjob = new ReloadCronjob(proxyServerService);

    // Fill dependency
    // --------------------------

    this._dependency.jwt = jwt;
    this._dependency.identifierGenerator = identifierGenerator;
    this._dependency.dateTime = dateTime;

    this._dependency.accessMiddlewareFactory = accessMiddlewareFactory;
    this._dependency.roleAccessMiddlewareFactory = roleAccessMiddlewareFactory;

    this._dependency.jobHttpApi = {
      jobControllerFactory,
    };

    this._dependency.oauthHttpApi = {
      oauthControllerFactory,
    };

    this._dependency.packageHttpApi = {
      createPackageValidationMiddlewareFactory: packageMiddlewares.createPackageValidation,
      renewPackageValidatorMiddlewareFactory: packageMiddlewares.renewPackageValidator,
      packageControllerFactory,
    };

    this._dependency.proxyHttpApi = {
      deleteProxyIpValidatorMiddlewareFactory: proxyMiddleware.deleteProxyIpValidation,
      generateProxyValidatorMiddlewareFactory: proxyMiddleware.generateProxyValidation,
      proxyControllerFactory,
    };

    this._dependency.userHttpApi = {
      addUserValidationMiddlewareFactory: userMiddlewares.addUserValidation,
      blockUrlForUserValidationMiddlewareFactory: userMiddlewares.blockUrlForUserValidation,
      changePasswordUserValidationMiddlewareFactory: userMiddlewares.changePasswordUserValidation,
      selfUserAccessMiddlewareFactory: userMiddlewares.selfUserAccess,
      userControllerFactory,
    };

    this._dependency.serverHttpApi = {
      addServerValidationMiddlewareFactory: serverMiddlewares.addServerValidation,
      updateServerValidationMiddlewareFactory: serverMiddlewares.updateServerValidation,
      serverControllerFactory,
    };

    this._dependency.packageCronjob = packageCronjob;
    this._dependency.reloadCronjob = reloadCronjob;

    if (this._options.cli) {
      await this._cli();

      return;
    }

    if (cluster.isMaster) {
      await this._cronJob();
    }

    await this._api();
  }

  _cluster() {
    const cpuCount = this._config.getBool('cluster.server.enable')
      ? this._config.getStr('cluster.server.mode', 'none') === 'auto'
        ? os.cpus().length
        : this._config.getNum('cluster.server.count')
      : 1;

    if (cluster.isMaster) {
      for (let i = 0; i < cpuCount; i++) {
        cluster.fork();
      }

      cluster.on('online', (worker) => {
        console.log(`Worker ${worker.process.pid} is online.`);
      });
      cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died.`);
        cluster.fork();
      });
    } else {
      console.log(`Start worker: ${process.pid}`);
    }
  }

  async _cli() {
    const cliApi = new CliApi(this._config, this._options, this._dependency);

    await cliApi.start();
  }

  async _cronJob() {
    const cronjobApi = new CronjobApi(this._config, this._options, this._dependency);

    await cronjobApi.start();
  }

  async _api() {
    const expressApi = new ExpressApi(this._config, this._options, this._dependency);

    await expressApi.start();
  }

  async _db() {
    const pgDb = new PgDb(this._config, this._options, {});

    return { pgDb: await pgDb.start() };
  }

  async _jwt() {
    const jwt = new JwtUtil(this._config, this._options, {});

    return { jwt: await jwt.start() };
  }

  async _fileLocation() {
    const file = new FileUtil(this._config, this._options, {});
    const {
      squidVolumeFolder,
      squidPasswordFile,
      squidIpAccessFile,
      squidIpAccessBashFile,
      squidConfFolder,
    } = await file.start();

    return {
      squidVolumeFolder,
      squidPasswordFile,
      squidIpAccessFile,
      squidIpAccessBashFile,
      squidConfFolder,
    };
  }

  async _docker() {
    const docker = new DockerUtil(this._config, this._options, {});

    return { docker: await docker.start() };
  }

  async _discord() {
    const discord = new DiscordOauth(this._config, this._options, {});

    return { discord: await discord.start() };
  }

  async _apiCluster(jwt) {
    const apiCluster = new ApiCluster(this._config, this._options, { jwt });
    const data = await apiCluster.start();

    return { apiToken: data.apiToken };
  }
}

module.exports = Loader;
