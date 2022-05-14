/**
 * Created by pooya on 8/29/21.
 */

const cluster = require('cluster');
const expressApi = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const IRunner = require('~interface/iRunner');

const app = expressApi();
const router = expressApi.Router();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
  }),
);
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
      if (error) {
        this._sendFail(res, error, error['httpCode']);
      }

      next();
    });

    app.listen(port, host, () => {
      process.stdout.write(`API listening at http://${host}:${port}\n`);
    });
  }

  _route() {
    /**
     * @todo this is for test (should delete)
     */
    router.get('/store.html', async (req, res, next) => {
      res.end(`
        <html>
          <script
              id="fsc-api"
              src="https://d1f8f9xcsvx3ha.cloudfront.net/sbl/0.7.9/fastspring-builder.min.js"
              type="text/javascript"
              data-storefront="fastspringexamples.test.onfastspring.com/popup-fastspringexamples"
          >
          </script>
          <body>
              <button data-fsc-item-path-value="phot-io-main-app" data-fsc-action='Add, Checkout'> Buy </button>
          </body>
      </html>
      `);
    });

    router.use(async (req, res, next) => {
      try {
        const accessMiddleware = this._dependency.accessMiddlewareFactory.create(req, res);
        await accessMiddleware.act();

        return next(null);
      } catch (error) {
        return next(error);
      }
    });

    this._jobRoute();
    this._userRoute();
    this._packageRoute();
    this._proxyRoute();
    this._instanceRoute();
    this._serverRoute();
    this._oauthRoute();
    this._logRoute();
    this._orderRoute();
    this._productRoute();
    this._paymentRoute();
  }

  _jobRoute() {
    const jobHttpApi = this._dependency.jobHttpApi;

    router.get('/v1/job/:jobId', this._middlewareRoleAccess(['admin']), async (req, res, next) => {
      try {
        const jobController = jobHttpApi.jobControllerFactory.create(req, res);
        const response = await jobController.getJobById();

        this._sendResponse(req, res, response);

        return next(null);
      } catch (error) {
        return next(error);
      }
    });
  }

  _userRoute() {
    const userHttpApi = this._dependency.userHttpApi;
    const orderHttpApi = this._dependency.orderHttpApi;

    router.get('/v1/user', this._middlewareRoleAccess(['admin']), async (req, res, next) => {
      try {
        const userController = userHttpApi.userControllerFactory.create(req, res);
        const response = await userController.getAllUsers();

        this._sendResponse(req, res, response);

        return next(null);
      } catch (error) {
        return next(error);
      }
    });

    router.get(
      '/v1/user/:userId',
      this._middlewareRoleAccess(['user', 'admin']),
      this._middlewareUrlAccess(),
      async (req, res, next) => {
        try {
          const middleware = userHttpApi.selfUserAccessMiddlewareFactory.create(req, res, [
            'admin',
          ]);

          await middleware.act();

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const userController = userHttpApi.userControllerFactory.create(req, res);
          const response = await userController.getUserById();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.post(
      '/v1/user',
      async (req, res, next) => {
        try {
          const middleware = userHttpApi.addUserValidationMiddlewareFactory.create(req, res);

          await middleware.act();

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const userController = userHttpApi.userControllerFactory.create(req, res);
          const response = await userController.addUser();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.post(
      '/v1/user/login',
      async (req, res, next) => {
        try {
          const middleware = userHttpApi.addUserValidationMiddlewareFactory.create(req, res);

          await middleware.act();

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const userController = userHttpApi.userControllerFactory.create(req, res);
          const response = await userController.loginUser();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.put(
      '/v1/user/:username/password',
      this._middlewareRoleAccess(['user', 'admin']),
      this._middlewareUrlAccess(),
      async (req, res, next) => {
        try {
          const middleware = userHttpApi.changePasswordUserValidationMiddlewareFactory.create(
            req,
            res,
          );

          await middleware.act();

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const userController = userHttpApi.userControllerFactory.create(req, res);
          const response = await userController.changePassword();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.put(
      '/v1/user/:username/disable',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const userController = userHttpApi.userControllerFactory.create(req, res);
          const response = await userController.disableByUsername();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.put(
      '/v1/user/:username/enable',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const userController = userHttpApi.userControllerFactory.create(req, res);
          const response = await userController.enableByUsername();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.post(
      '/v1/user/:username/website/block',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const middleware = userHttpApi.blockUrlForUserValidationMiddlewareFactory.create(
            req,
            res,
          );

          await middleware.act();

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const userController = userHttpApi.userControllerFactory.create(req, res);
          const response = await userController.blockAccessToUrlByUsername();

          this._sendResponse(req, res, response);

          return next(null);
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

        return next(null);
      } catch (error) {
        return next(error);
      }
    });

    router.get(
      `/v1/user/:userId/order`,
      this._middlewareRoleAccess(['user']),
      this._middlewareUrlAccess(),
      async (req, res, next) => {
        try {
          const orderController = orderHttpApi.orderControllerFactory.create(req, res);
          const response = await orderController.getAllOrderForUser();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.get(
      `/v1/user/:userId/order/:orderId/subscription`,
      this._middlewareRoleAccess(['user']),
      this._middlewareUrlAccess(),
      async (req, res, next) => {
        try {
          const orderController = orderHttpApi.orderControllerFactory.create(req, res);
          const response = await orderController.getAllSubscriptionOfOrder();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.post(
      `/v1/user/:userId/order`,
      this._middlewareRoleAccess(['user']),
      this._middlewareUrlAccess(),
      async (req, res, next) => {
        try {
          const middleware = orderHttpApi.addOrderValidationMiddlewareFactory.create(req, res);

          await middleware.act();

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const orderController = orderHttpApi.orderControllerFactory.create(req, res);
          const response = await orderController.addOrder();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );
  }

  _packageRoute() {
    const packageHttpApi = this._dependency.packageHttpApi;

    router.get(
      '/v1/package/user/:username',
      this._middlewareRoleAccess(['user', 'admin']),
      this._middlewareUrlAccess(),
      async (req, res, next) => {
        try {
          const packageController = packageHttpApi.packageControllerFactory.create(req, res);
          const response = await packageController.getAllByUsername();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.post(
      '/v1/package',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const middleware = packageHttpApi.createPackageValidationMiddlewareFactory.create(
            req,
            res,
          );

          await middleware.act();

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const packageController = packageHttpApi.packageControllerFactory.create(req, res);
          const response = await packageController.addPackage();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.put(
      '/v1/package/:packageId/renew',
      this._middlewareRoleAccess(['user', 'admin']),
      this._middlewareUrlAccess(),
      async (req, res, next) => {
        try {
          const middleware = packageHttpApi.renewPackageValidatorMiddlewareFactory.create(req, res);

          await middleware.act();

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const packageController = packageHttpApi.packageControllerFactory.create(req, res);
          const response = await packageController.renewPackage();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.put(
      '/v1/package/:packageId/cancel',
      this._middlewareRoleAccess(['user', 'admin']),
      this._middlewareUrlAccess(),
      async (req, res, next) => {
        try {
          const packageController = packageHttpApi.packageControllerFactory.create(req, res);
          const response = await packageController.cancelPackage();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.post(
      '/v1/package/:packageId/sync',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const packageController = packageHttpApi.packageControllerFactory.create(req, res);
          const response = await packageController.syncPackage();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.delete(
      '/v1/package/:packageId',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const packageController = packageHttpApi.packageControllerFactory.create(req, res);
          const response = await packageController.removePackage();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );
  }

  _proxyRoute() {
    const proxyHttpApi = this._dependency.proxyHttpApi;

    router.get('/v1/proxy/ip', this._middlewareRoleAccess(['admin']), async (req, res, next) => {
      try {
        const proxyController = proxyHttpApi.proxyControllerFactory.create(req, res);
        const response = await proxyController.getAll();

        this._sendResponse(req, res, response);

        return next(null);
      } catch (error) {
        return next(error);
      }
    });

    router.post(
      '/v1/proxy/generate',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const middleware = proxyHttpApi.generateProxyValidatorMiddlewareFactory.create(req, res);

          await middleware.act();

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const proxyController = proxyHttpApi.proxyControllerFactory.create(req, res);
          const response = await proxyController.generateIp();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.post(
      '/v1/proxy/reload',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const proxyController = proxyHttpApi.proxyControllerFactory.create(req, res);
          const response = await proxyController.reload();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.delete(
      '/v1/proxy/ip',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const middleware = proxyHttpApi.deleteProxyIpValidatorMiddlewareFactory.create(req, res);

          await middleware.act();

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const proxyController = proxyHttpApi.proxyControllerFactory.create(req, res);
          const response = await proxyController.deleteProxyIp();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );
  }

  _instanceRoute() {
    const packageHttpApi = this._dependency.packageHttpApi;
    const userHttpApi = this._dependency.userHttpApi;
    const serverHttpApi = this._dependency.serverHttpApi;

    router.post(
      '/v1/instance/self/user',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const middleware = userHttpApi.addUserValidationMiddlewareFactory.create(req, res);

          await middleware.act();

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const userController = userHttpApi.userControllerFactory.create(req, res);
          const response = await userController.addUserInSelfInstance();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.put(
      '/v1/instance/self/user/:username/password',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const middleware = userHttpApi.changePasswordUserValidationMiddlewareFactory.create(
            req,
            res,
          );

          await middleware.act();

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const userController = userHttpApi.userControllerFactory.create(req, res);
          const response = await userController.changePasswordInSelfInstance();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.put(
      '/v1/instance/self/user/:username/disable',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const userController = userHttpApi.userControllerFactory.create(req, res);
          const response = await userController.disableByUsernameInSelfInstance();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.put(
      '/v1/instance/self/user/:username/enable',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const userController = userHttpApi.userControllerFactory.create(req, res);
          const response = await userController.enableByUsernameInSelfInstance();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.get(
      '/v1/instance/self/package/user/:username',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const packageController = packageHttpApi.packageControllerFactory.create(req, res);
          const response = await packageController.getAllByUsernameInSelfInstance();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.get(
      '/v1/instance/self/server/interface',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const serverController = serverHttpApi.serverControllerFactory.create(req, res);
          const response = await serverController.getAllInterfaceInSelfInstance();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );
  }

  _serverRoute() {
    const serverHttpApi = this._dependency.serverHttpApi;

    router.get('/v1/server', this._middlewareRoleAccess(['admin']), async (req, res, next) => {
      try {
        const serverController = serverHttpApi.serverControllerFactory.create(req, res);
        const response = await serverController.getAll();

        this._sendResponse(req, res, response);

        return next(null);
      } catch (error) {
        return next(error);
      }
    });

    router.get(
      '/v1/server/interface',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const serverController = serverHttpApi.serverControllerFactory.create(req, res);
          const response = await serverController.getAllInterface();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.post(
      '/v1/server',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const middleware = serverHttpApi.addServerValidationMiddlewareFactory.create(req, res);

          await middleware.act();

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const serverController = serverHttpApi.serverControllerFactory.create(req, res);
          const response = await serverController.add();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.put(
      '/v1/server/:id',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const middleware = serverHttpApi.updateServerValidationMiddlewareFactory.create(req, res);

          await middleware.act();

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const serverController = serverHttpApi.serverControllerFactory.create(req, res);
          const response = await serverController.update();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.delete(
      '/v1/server/:id',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const serverController = serverHttpApi.serverControllerFactory.create(req, res);
          const response = await serverController.delete();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );
  }

  _oauthRoute() {
    const oauthHttpApi = this._dependency.oauthHttpApi;

    router.get('/v1/oauth', async (req, res, next) => {
      try {
        const oauthController = oauthHttpApi.oauthControllerFactory.create(req, res);
        const response = await oauthController.getOptions();

        this._sendResponse(req, res, response);

        return next(null);
      } catch (error) {
        return next(error);
      }
    });

    router.post('/v1/oauth/:platform', async (req, res, next) => {
      try {
        const oauthController = oauthHttpApi.oauthControllerFactory.create(req, res);
        const response = await oauthController.auth();

        this._sendResponse(req, res, response);

        return next(null);
      } catch (error) {
        return next(error);
      }
    });

    router.get('/v1/oauth/:platform/callback', async (req, res, next) => {
      try {
        const oauthController = oauthHttpApi.oauthControllerFactory.create(req, res);
        const [error, url] = await oauthController.verify();

        if (error) {
          this._sendResponse(req, res, [error]);
        } else {
          res.redirect(url);
        }

        return next(null);
      } catch (error) {
        return next(error);
      }
    });
  }

  _logRoute() {
    /**
     * @todo Should create controller and service with model for store and get data
     */
    router.post('/v1/log', this._middlewareRoleAccess(['admin']), async (req, res, next) => {
      console.log(req.headers);
      console.log(req.body);

      res.status(204).end();
      next(null);
    });
  }

  _orderRoute() {
    const orderHttpApi = this._dependency.orderHttpApi;

    router.get('/v1/order', this._middlewareRoleAccess(['admin']), async (req, res, next) => {
      try {
        const orderController = orderHttpApi.orderControllerFactory.create(req, res);
        const response = await orderController.getAllOrderForAdmin();

        this._sendResponse(req, res, response);

        return next(null);
      } catch (error) {
        return next(error);
      }
    });

    router.get(
      '/v1/order/:orderId/subscription',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const orderController = orderHttpApi.orderControllerFactory.create(req, res);
          const response = await orderController.getAllSubscriptionOfOrder();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.post(
      '/v1/order/:orderId/package',
      this._middlewareRoleAccess(['user']),
      this._middlewareUrlAccess(),
      async (req, res, next) => {
        try {
          const middleware = orderHttpApi.verifyOrderValidationMiddlewareFactory.create(req, res);

          await middleware.act();

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const orderController = orderHttpApi.orderControllerFactory.create(req, res);
          const response = await orderController.verifyOrderPackage();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.post('/v1/order/process/service/:paymentService', async (req, res, next) => {
      try {
        const orderController = orderHttpApi.orderControllerFactory.create(req, res);
        const response = await orderController.processOrder();

        this._sendResponse(req, res, response);

        return next(null);
      } catch (error) {
        return next(error);
      }
    });
  }

  _productRoute() {
    const productHttpApi = this._dependency.productHttpApi;

    router.get('/v1/product', this._middlewareRoleAccess(['admin']), async (req, res, next) => {
      try {
        const serverController = productHttpApi.productControllerFactory.create(req, res);
        const response = await serverController.getAllProduct();

        this._sendResponse(req, res, response);

        return next(null);
      } catch (error) {
        return next(error);
      }
    });

    router.get('/v1/product/list', async (req, res, next) => {
      try {
        const serverController = productHttpApi.productControllerFactory.create(req, res);
        const response = await serverController.getAllEnableProduct();

        this._sendResponse(req, res, response);

        return next(null);
      } catch (error) {
        return next(error);
      }
    });

    router.post(
      '/v1/product',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const middleware = productHttpApi.addProductValidationMiddlewareFactory.create(req, res);

          await middleware.act();

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const serverController = productHttpApi.productControllerFactory.create(req, res);
          const response = await serverController.addProduct();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.post(
      '/v1/product/:productId/external-store',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const middleware = productHttpApi.addExternalStoreValidationMiddlewareFactory.create(
            req,
            res,
          );

          await middleware.act();

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const serverController = productHttpApi.productControllerFactory.create(req, res);
          const response = await serverController.addExternalStoreProduct();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.put(
      '/v1/product/:id/disable',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const serverController = productHttpApi.productControllerFactory.create(req, res);
          const response = await serverController.disableProduct();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.put(
      '/v1/product/:id/enable',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const serverController = productHttpApi.productControllerFactory.create(req, res);
          const response = await serverController.enableProduct();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.put(
      '/v1/product/:id',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const middleware = productHttpApi.updateProductValidationMiddlewareFactory.create(
            req,
            res,
          );

          await middleware.act();

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const serverController = productHttpApi.productControllerFactory.create(req, res);
          const response = await serverController.updateProduct();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.put(
      '/v1/product/:productId/external-store/:externalStoreId',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const middleware = productHttpApi.updateExternalStoreValidationMiddlewareFactory.create(
            req,
            res,
          );

          await middleware.act();

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
      async (req, res, next) => {
        try {
          const serverController = productHttpApi.productControllerFactory.create(req, res);
          const response = await serverController.updateExternalStoreProduct();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.delete(
      '/v1/product/:id',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const serverController = productHttpApi.productControllerFactory.create(req, res);
          const response = await serverController.deleteProduct();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );

    router.delete(
      '/v1/product/:productId/external-store/:externalStoreId',
      this._middlewareRoleAccess(['admin']),
      async (req, res, next) => {
        try {
          const serverController = productHttpApi.productControllerFactory.create(req, res);
          const response = await serverController.deleteExternalStoreProduct();

          this._sendResponse(req, res, response);

          return next(null);
        } catch (error) {
          return next(error);
        }
      },
    );
  }

  _paymentRoute() {
    const paymentHttpApi = this._dependency.paymentHttpApi;

    router.get(`/v1/payment/list`, async (req, res, next) => {
      try {
        const paymentController = paymentHttpApi.paymentControllerFactory.create(req, res);
        const response = await paymentController.getAllPaymentMethod();

        this._sendResponse(req, res, response);

        return next(null);
      } catch (error) {
        return next(error);
      }
    });
  }

  _middlewareRoleAccess(roles) {
    return async (req, res, next) => {
      try {
        const userAccessMiddleware = this._dependency.roleAccessMiddlewareFactory.create(
          req,
          res,
          roles,
        );
        await userAccessMiddleware.act();

        return next(null);
      } catch (error) {
        return next(error);
      }
    };
  }

  _middlewareUrlAccess() {
    return async (req, res, next) => {
      try {
        const urlAccessMiddleware = this._dependency.urlAccessMiddlewareFactory.create(req, res);
        await urlAccessMiddleware.act();

        return next(null);
      } catch (error) {
        return next(error);
      }
    };
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
        statusCode = 200;
        break;
    }

    this._sendResult(res, result, statusCode);
  }

  _sendResult(res, data, statusCode = 200) {
    const obj = {
      status: 'success',
      ...(Array.isArray(data) && { totalItem: data.length }),
      data,
    };

    res.status(statusCode).json(obj);
  }

  _sendFail(res, error, statusCode = 400) {
    console.error(error);

    const obj = {
      status: 'error',
      name: error.name,
      error: error.message.toString(),
      ...(error.additionalInfo && { additionalInfo: error.additionalInfo }),
    };

    res.status(statusCode).json(obj);
  }
}

module.exports = ExpressApi;
