/**
 * Created by pooya on 8/29/21.
 */

const { Command } = require('commander');
const IRunner = require('~interface/iRunner');

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

    this._program
      .command('generate-token')
      .alias('t')
      .description('Generate token for access api')
      .action(() => {
        const data = { role: 'admin' };
        console.log(jwt.sign(data));
      });

    this._program.parse(process.argv);
  }
}

module.exports = CliApi;
