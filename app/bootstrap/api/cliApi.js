/**
 * Created by pooya on 8/29/21.
 */

const { Command } = require('commander');
const IRunner = require('~interface/iRunner');
const UserModel = require('~src/core/model/userModel');

class CliApi extends IRunner {
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
    this._program = new Command();
  }

  async start() {
    const jwt = this._dependency.jwt;
    const findClusterUserService = this._dependency.findClusterUserService;

    this._program
      .command('generate-token')
      .alias('t')
      .description('Generate token for access api')
      .action(() => {
        const data = { role: 'admin' };
        console.log(jwt.sign(data));
      });

    this._program
      .command('add-admin')
      .alias('a')
      .description('Add admin user')
      .action(async () => {
        let result;

        const userModel = new UserModel();
        userModel.username = 'admin';

        const [fetchError, fetchData] = await findClusterUserService.getAll(userModel);
        if (fetchError) {
          console.error(`[ERR] Fail to create admin user`, fetchError);
          process.exit(1);
        }
        if (!fetchData || (fetchData && fetchData.length === 0)) {
          userModel.password = `${new Date().getTime()}${Math.floor(Math.random() * 100000) + 10}`;

          const [addError, addData] = await findClusterUserService.addAdmin(userModel);
          if (addError) {
            console.error(`[ERR] Fail to create admin user`, addError);
            process.exit(1);
          }

          result = addData;
        } else {
          result = fetchData[0];
        }


        console.log(`[INFO] User info:`);
        console.log(`  Username: ${result.username}`);
        console.log(`  Password: ${result.password}`);
        process.exit(0);
      });

    this._program.parse(process.argv);
  }
}

module.exports = CliApi;
