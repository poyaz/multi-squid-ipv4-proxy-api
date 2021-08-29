/**
 * Created by pooya on 8/29/21.
 */

const os = require('os');
const cluster = require('cluster');
const Config = require('~config');

const ExpressApi = require('./bootstrap/api/expressApi');
const CliApi = require('./bootstrap/api/cliApi');
const PgDb = require('./bootstrap/db/pgDb');
const FileUtil = require('./bootstrap/util/fileUtil');
const JwtUtil = require('./bootstrap/util/jwtUtil');

const DateTime = require('~src/infrastructure/system/dateTime');
const IdentifierGenerator = require('~src/infrastructure/system/identifierGenerator');

const PackageFileRepository = require('~src/infrastructure/system/packageFileRepository');
const UserSquidRepository = require('~src/infrastructure/system/userSquidRepository');
const PackagePgRepository = require('~src/infrastructure/database/packagePgRepository');
const UrlAccessPgRepository = require('~src/infrastructure/database/urlAccessPgRepository');
const UserPgRepository = require('~src/infrastructure/database/userPgRepository');

const PackageService = require('~src/core/service/packageService');
const UrlAccessService = require('~src/core/service/urlAccessService');
const UserService = require('~src/core/service/userService');

const CreatePackageValidationMiddlewareFactory = require('~src/api/http/package/middleware/createPackageValidationMiddlewareFactory');
const RenewPackageValidatorMiddlewareFactory = require('~src/api/http/package/middleware/renewPackageValidatorMiddlewareFactory');
const PackageControllerFactory = require('~src/api/http/package/controller/packageControllerFactory');

const AddUserValidationMiddlewareFactory = require('~src/api/http/user/middleware/addUserValidationMiddlewareFactory');
const BlockUrlForUserValidationMiddlewareFactory = require('~src/api/http/user/middleware/blockUrlForUserValidationMiddlewareFactory');
const ChangePasswordUserValidationMiddlewareFactory = require('~src/api/http/user/middleware/changePasswordUserValidationMiddlewareFactory');
const UserControllerFactory = require('~src/api/http/user/controller/userControllerFactory');

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

    const { squidPasswordFile, squidIpAccessFile } = await this._fileLocation();
    const { pgDb } = await this._db();
    const { jwt } = await this._jwt();

    const identifierGenerator = new IdentifierGenerator();
    const dateTime = new DateTime();

    // Repository
    // ----------

    const packageFileRepository = new PackageFileRepository(squidIpAccessFile);
    const userSquidRepository = new UserSquidRepository(squidPasswordFile);

    const packagePgRepository = new PackagePgRepository(pgDb, dateTime, identifierGenerator);
    const urlAccessPgRepository = new UrlAccessPgRepository(pgDb, dateTime, identifierGenerator);
    const userPgRepository = new UserPgRepository(pgDb, dateTime, identifierGenerator);

    // Service
    // -------

    const userService = new UserService(userPgRepository, userSquidRepository);
    const packageService = new PackageService(
      userService,
      packagePgRepository,
      packageFileRepository,
      null,
    );
    const urlAccessService = new UrlAccessService(userService, urlAccessPgRepository);

    // Controller and middleware
    // -------------------------

    const packageMiddlewares = {
      createPackageValidation: new CreatePackageValidationMiddlewareFactory(),
      renewPackageValidator: new RenewPackageValidatorMiddlewareFactory(),
    };
    const packageControllerFactory = new PackageControllerFactory(packageService, dateTime);

    const userMiddlewares = {
      addUserValidation: new AddUserValidationMiddlewareFactory(),
      blockUrlForUserValidation: new BlockUrlForUserValidationMiddlewareFactory(),
      changePasswordUserValidation: new ChangePasswordUserValidationMiddlewareFactory(),
    };
    const userControllerFactory = new UserControllerFactory(
      userService,
      dateTime,
      urlAccessService,
    );

    // Fill dependency
    // --------------------------

    this._dependency.jwt = jwt;
    this._dependency.identifierGenerator = identifierGenerator;
    this._dependency.dateTime = dateTime;

    this._dependency.packageHttpApi = {
      createPackageValidationMiddlewareFactory: packageMiddlewares.createPackageValidation,
      renewPackageValidatorMiddlewareFactory: packageMiddlewares.renewPackageValidator,
      packageControllerFactory,
    };

    this._dependency.userHttpApi = {
      addUserValidationMiddlewareFactory: userMiddlewares.addUserValidation,
      blockUrlForUserValidationMiddlewareFactory: userMiddlewares.blockUrlForUserValidation,
      changePasswordUserValidationMiddlewareFactory: userMiddlewares.changePasswordUserValidation,
      userControllerFactory,
    };

    if (this._options.cli) {
      await this._cli();

      return;
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
      });
    } else {
      console.log(`Start worker: ${process.pid}`);
    }
  }

  async _cli() {
    const cliApi = new CliApi(this._config, this._options, this._dependency);

    await cliApi.start();
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
    const { squidPasswordFile, squidIpAccessFile } = await file.start();

    return { squidPasswordFile, squidIpAccessFile };
  }
}

module.exports = Loader;
