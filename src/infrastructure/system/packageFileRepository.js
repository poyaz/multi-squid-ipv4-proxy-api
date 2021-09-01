/**
 * Created by pooya on 8/26/21.
 */

const IPackageRepository = require('~src/core/interface/iPackageRepository');

const fs = require('fs');
const fsAsync = require('fs/promises');
const { spawn } = require('child_process');
const PackageModel = require('~src/core/model/packageModel');
const CommandExecuteException = require('~src/core/exception/commandExecuteException');
const ModelUsernameNotExistException = require('~src/core/exception/modelUsernameNotExistException');

class PackageFileRepository extends IPackageRepository {
  /**
   * @type {string}
   */
  #accessUserIpPath;

  /**
   *
   * @param {string} accessUserIpPath
   */
  constructor(accessUserIpPath) {
    super();

    this.#accessUserIpPath = accessUserIpPath;
  }

  async getAllByUsername(username) {
    const [checkFileExistError, isFileExist] = await this._checkFileExist(this.#accessUserIpPath);
    if (checkFileExistError) {
      return [checkFileExistError];
    }

    if (!isFileExist) {
      return [null, []];
    }

    try {
      const data = await fsAsync.readFile(this.#accessUserIpPath, 'utf8');

      const ipList = data
        .split(/\n/g)
        .map((v) => v.match(/(.+)\s(.+)$/))
        .filter((v) => v && v[2] === username)
        .map((v) => v[1]);

      const result = new PackageModel();
      result.username = username;
      result.ipList = ipList.map((v) => ({ ip: v }));

      return [null, [result]];
    } catch (error) {
      return [new CommandExecuteException(error)];
    }
  }

  async add(model) {
    try {
      for await (const data of model.ipList) {
        const record = `${data.ip} ${model.username}\n`;

        await fsAsync.appendFile(this.#accessUserIpPath, record);
      }

      return [null, model];
    } catch (error) {
      return [new CommandExecuteException(error)];
    }
  }

  async update(model) {
    if (!model.username) {
      return [new ModelUsernameNotExistException()];
    }

    let updatePattern = '';
    switch (true) {
      case model.expireDate instanceof Date && model.ipList.length > 0: {
        const ipList = model.ipList.map((v) => v.ip.replace(/\./g, '\\.')).join('\\|');
        updatePattern = `'/^#\\?\\(${ipList}\\) ${model.username}$/d'`;
        break;
      }
      case model.deleteDate instanceof Date:
        updatePattern = `'s/^\\([^#]\\+ ${model.username}\\)$/#\\1/g'`;
        break;
      case !model.deleteDate:
        updatePattern = `'s/^#\\(.\\+ ${model.username}\\)$/\\1/g'`;
        break;
    }

    try {
      const exec = spawn('sed', [`-i`, updatePattern, this.#accessUserIpPath]);

      let changeUserAccessError = '';
      for await (const chunk of exec.stderr) {
        changeUserAccessError += chunk;
      }
      if (changeUserAccessError) {
        return [new CommandExecuteException(new Error(changeUserAccessError))];
      }

      return [null];
    } catch (error) {
      return [new CommandExecuteException(error)];
    }
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
}

module.exports = PackageFileRepository;
