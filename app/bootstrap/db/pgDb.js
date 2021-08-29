/**
 * Created by pooya on 8/29/21.
 */

/**
 * @property builtins
 * @property builtins.NUMERIC
 */
const { Pool, types } = require('pg');

const IRunner = require('~interface/iRunner');

class PgDb extends IRunner {
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
    types.setTypeParser(types.builtins.NUMERIC, (value) => parseFloat(value));

    const dbOption = {
      host: this._config.getStr('database.pg.host'),
      port: this._config.getNum('database.pg.port'),
      database: this._config.getStr('database.pg.db'),
      user: this._config.getStr('database.pg.username'),
      password: this._config.getStr('database.pg.password'),
      max: this._config.getNum('database.pg.max'),
      idleTimeoutMillis: this._config.getNum('database.pg.idleTimeout'),
    };

    const hasUseSsl = this._config.getBool('database.pg.ssl');
    if (hasUseSsl) {
      const rejectUnauthorized = this._config.getBool(
        'database.pg.sslOption.rejectUnauthorized',
      );

      dbOption.ssl = {};
      dbOption.ssl.rejectUnauthorized = rejectUnauthorized;
    }

    const db = new Pool(dbOption);
    db.on('error', (error) => {
      throw error;
    });

    return db;
  }
}

module.exports = PgDb;
