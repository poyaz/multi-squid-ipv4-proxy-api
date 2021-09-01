/**
 * Created by pooya on 8/24/21.
 */

const IUserRepository = require('~src/core/interface/iUserRepository');

const fs = require('fs');
const fsAsync = require('fs/promises');
const { spawn } = require('child_process');
const CommandExecuteException = require('~src/core/exception/commandExecuteException');

class UserSquidRepository extends IUserRepository {
  /**
   * @type {string}
   */
  #passwdPathFile;

  constructor(passwdPathFile) {
    super();

    this.#passwdPathFile = passwdPathFile;
  }

  async isUserExist(username) {
    const [checkFileExistError, isFileExist] = await this._checkFileExist(this.#passwdPathFile);
    if (checkFileExistError) {
      return [checkFileExistError];
    }

    if (!isFileExist) {
      return [null, false];
    }

    try {
      const exec = spawn('htpasswd', ['-v', '-i', this.#passwdPathFile, username]);
      exec.stdin.end();

      let checkUserError = '';
      for await (const chunk of exec.stderr) {
        checkUserError += chunk;
      }
      if (checkUserError) {
        if (/not found/.test(checkUserError)) {
          return [null, false];
        }
        if (/verification failed/.test(checkUserError)) {
          return [null, true];
        }

        return [new CommandExecuteException(new Error(checkUserError))];
      }

      return [null, false];
    } catch (error) {
      return [new CommandExecuteException(error)];
    }
  }

  /**
   *
   * @param {UserModel} model
   */
  async add(model) {
    const [checkFileExistError, isFileExist] = await this._checkFileExist(this.#passwdPathFile);
    if (checkFileExistError) {
      return [checkFileExistError];
    }

    try {
      if (!isFileExist) {
        const fd = await fsAsync.open(this.#passwdPathFile, 'w');
        await fd.close();
      }

      const [addError] = await this._executePassword(model);
      if (addError) {
        return [addError];
      }

      const result = model.clone();
      result.password = '';

      return [null, result];
    } catch (error) {
      return [new CommandExecuteException(error)];
    }
  }

  async update(model) {
    return this._executePassword(model);
  }

  async _checkFileExist(filePath) {
    try {
      await fsAsync.access(filePath, fs.constants.F_OK | fs.constants.R_OK);

      return [null, true];
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [null, false];
      }

      return [new CommandExecuteException(error)];
    }
  }

  async _executePassword(model) {
    try {
      const exec = spawn('htpasswd', ['-b', '-m', '-i', this.#passwdPathFile, model.username]);
      exec.stdin.write(model.password);
      exec.stdin.end();

      let executeError = '';
      for await (const chunk of exec.stderr) {
        executeError += chunk;
      }
      if (executeError) {
        return [new CommandExecuteException(new Error(executeError))];
      }

      return [null];
    } catch (error) {
      return [new CommandExecuteException(error)];
    }
  }
}

module.exports = UserSquidRepository;
