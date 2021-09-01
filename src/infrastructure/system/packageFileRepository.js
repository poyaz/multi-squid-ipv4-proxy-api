/**
 * Created by pooya on 8/26/21.
 */

const IPackageRepository = require('~src/core/interface/iPackageRepository');

const fs = require('fs');
const fsAsync = require('fs/promises');
const PackageModel = require('~src/core/model/packageModel');
const CommandExecuteException = require('~src/core/exception/commandExecuteException');

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
