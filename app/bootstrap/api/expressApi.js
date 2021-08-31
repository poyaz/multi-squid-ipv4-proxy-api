/**
 * Created by pooya on 8/29/21.
 */

const cluster = require('cluster');
const expressApi = require('express');
const bodyParser = require('body-parser');
const IRunner = require('~interface/iRunner');

const app = expressApi();
const router = expressApi.Router();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

class ExpressApi extends IRunner {
  /**
   *
   * @param {IConfig} config
   * @param {Object} options
   * @param {*} dependency
   */
  constructor(config, options, dependency) {
    super();

    this._config = config;
    this._options = options;
    this._cwd = options.cwd;
    this._dependency = dependency;
  }

  async start() {
    if (cluster.isMaster) {
      return;
    }

    const host = this._config.get('server.host');
    const port = this._config.getNum('server.http.port');

    app.use('/api', router);

    this._route();

    app.use((error, req, res, next) => {
      this._sendFail(res, error);
      next();
    });

    app.listen(port, host, () => {
      process.stdout.write(`API listening at http://${host}:${port}\n`);
    });
  }

  _route() {
    const jwt = this._dependency.jwt;

    router.use((req, res, next) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.sendStatus(401);
      }

      try {
        jwt.verify(token);

        return next(null);
      } catch (error) {
        res.sendStatus(403);
      }
    });

    this._jobRoute();
    this._userRoute();
    this._packageRoute();
    this._proxyRoute();
  }

  _jobRoute() {
    const jobHttpApi = this._dependency.jobHttpApi;

    router.get('/v1/job/:jobId', async (req, res, next) => {
      try {
        const jobController = jobHttpApi.jobControllerFactory.create(req, res);
        const response = await jobController.getJobByid();

        this._sendResponse(req, res, response);
      } catch (error) {
        return next(error);
      }
    });
  }

  _userRoute() {
    const userHttpApi = this._dependency.userHttpApi;

    router.get('/v1/user', async (req, res, next) => {
      try {
        const userController = userHttpApi.userControllerFactory.create(req, res);
        const response = await userController.getAllUsers();

        this._sendResponse(req, res, response);
      } catch (error) {
        return next(error);
      }
    });

    router.post(
      '/v1/user',
      async (req, res, next) => {
        try {
          const middleware = userHttpApi.addUserValidationMiddlewareFactory.create(req, res);

          await middleware.act();
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const userController = userHttpApi.userControllerFactory.create(req, res);
          const response = await userController.addUser();

          this._sendResponse(req, res, response);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.put(
      '/v1/user/:username/password',
      async (req, res, next) => {
        try {
          const middleware = userHttpApi.changePasswordUserValidationMiddlewareFactory.create(
            req,
            res,
          );

          await middleware.act();
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const userController = userHttpApi.userControllerFactory.create(req, res);
          const response = await userController.changePassword();

          this._sendResponse(req, res, response);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.put('/v1/user/:username/disable', async (req, res, next) => {
      try {
        const userController = userHttpApi.userControllerFactory.create(req, res);
        const response = await userController.disableByUsername();

        this._sendResponse(req, res, response);
      } catch (error) {
        return next(error);
      }
    });

    router.put('/v1/user/:username/enable', async (req, res, next) => {
      try {
        const userController = userHttpApi.userControllerFactory.create(req, res);
        const response = await userController.enableByUsername();

        this._sendResponse(req, res, response);
      } catch (error) {
        return next(error);
      }
    });

    router.post(
      '/v1/user/:username/website/block',
      async (req, res, next) => {
        try {
          const middleware = userHttpApi.blockUrlForUserValidationMiddlewareFactory.create(
            req,
            res,
          );

          await middleware.act();
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const userController = userHttpApi.userControllerFactory.create(req, res);
          const response = await userController.blockAccessToUrlByUsername();

          this._sendResponse(req, res, response);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.get('/v1/user/:username/domain/:domain/status', async (req, res, next) => {
      try {
        const userController = userHttpApi.userControllerFactory.create(req, res);
        const response = await userController.checkBlockDomainForUsername();

        this._sendResponse(req, res, response);
      } catch (error) {
        return next(error);
      }
    });
  }

  _packageRoute() {
    const packageHttpApi = this._dependency.packageHttpApi;

    router.get('/v1/package/user/:username', async (req, res, next) => {
      try {
        const packageController = packageHttpApi.packageControllerFactory.create(req, res);
        const response = await packageController.getAllByUsername();

        this._sendResponse(req, res, response);
      } catch (error) {
        return next(error);
      }
    });

    router.post(
      '/v1/package',
      async (req, res, next) => {
        try {
          const middleware = packageHttpApi.createPackageValidationMiddlewareFactory.create(
            req,
            res,
          );

          await middleware.act();
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const packageController = packageHttpApi.packageControllerFactory.create(req, res);
          const response = await packageController.addPackage();

          this._sendResponse(req, res, response);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.put(
      '/v1/package/:packageId/renew',
      async (req, res, next) => {
        try {
          const middleware = packageHttpApi.renewPackageValidator.create(req, res);

          await middleware.act();
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const packageController = packageHttpApi.packageControllerFactory.create(req, res);
          const response = await packageController.renewPackage();

          this._sendResponse(req, res, response);
        } catch (error) {
          return next(error);
        }
      },
    );
  }

  _proxyRoute() {
    const proxyHttpApi = this._dependency.proxyHttpApi;

    router.post(
      '/v1/proxy/generate',
      async (req, res, next) => {
        try {
          const middleware = proxyHttpApi.generateProxyValidatorMiddlewareFactory.create(req, res);

          await middleware.act();
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const proxyController = proxyHttpApi.proxyControllerFactory.create(req, res);
          const response = await proxyController.generateIp();

          this._sendResponse(req, res, response);
        } catch (error) {
          return next(error);
        }
      },
    );
  }

  _sendResponse(req, res, response) {
    const [error, result] = response;

    if (error) {
      const statusCode = error.httpCode || 400;
      this._sendFail(res, error, statusCode);

      return;
    }

    let statusCode = 200;
    switch (req.method.toLowerCase()) {
      case 'post':
        statusCode = 201;
        break;
      case 'get':
      case 'put':
        statusCode = 200;
        break;
      case 'delete':
        statusCode = 204;
        break;
    }

    this._sendResult(res, result, statusCode);
  }

  _sendResult(res, data, statusCode = 200) {
    const obj = {
      status: 'success',
      data,
    };

    res.status(statusCode).json(obj);
  }

  _sendFail(res, error, statusCode = 400) {
    const obj = {
      status: 'error',
      error: error.message.toString(),
      ...(error.additionalInfo && { additionalInfo: error.additionalInfo }),
    };

    res.status(statusCode).json(obj);
  }
}

module.exports = ExpressApi;
