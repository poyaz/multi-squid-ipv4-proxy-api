/**
 * Created by pooya on 8/26/21.
 */

const IPackageRepository = require('~src/core/interface/iPackageRepository');

const fsAsync = require('fs/promises');
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

  async add(model) {
    try {
      for await (const data of model.ipList) {
        const record = `${data.ip} ${model.username}`;

        await fsAsync.appendFile(this.#accessUserIpPath, record);
      }

      return [null, model];
    } catch (error) {
      return [new CommandExecuteException(error)];
    }
  }
}

module.exports = PackageFileRepository;
