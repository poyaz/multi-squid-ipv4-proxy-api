/**
 * Created by pooya on 8/29/21.
 */

const path = require('path');
const fs = require('fs');
const fsAsync = require('fs/promises');
const cluster = require('cluster');

const IRunner = require('~interface/iRunner');

class FileUtil extends IRunner {
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

    this._templateFolder = `${this._cwd}${path.sep}storage${path.sep}temp${path.sep}template`;
    this._templateSquidFolder = `${this._cwd}${path.sep}storage${path.sep}temp${path.sep}template${path.sep}squid`;
    this._templateSquidConfFolder = `${this._cwd}${path.sep}storage${path.sep}defaultSquidConf`;
    this._squidVolumeFolder = `${this._cwd}${path.sep}storage${path.sep}temp${path.sep}squidVolume`;
    this._squidPasswordFile = `${this._cwd}${path.sep}storage${path.sep}temp${path.sep}template${path.sep}squid${path.sep}squid-pwd.htpasswd`;
    this._squidIpAccessFile = `${this._cwd}${path.sep}storage${path.sep}temp${path.sep}template${path.sep}squid${path.sep}squid-user-ip.conf`;
    this._squidIpAccessBashFile = `${this._cwd}${path.sep}storage${path.sep}scripts${path.sep}squid-block-domain.sh`;
  }

  async start() {
    if (cluster.isMaster) {
      const checkTemplateFolderExist = await this._checkFolderExist(this._templateFolder);
      if (!checkTemplateFolderExist) {
        await fsAsync.mkdir(this._templateFolder);
      }

      const checkTemplateSquidFolderExist = await this._checkFolderExist(this._templateSquidFolder);
      if (!checkTemplateSquidFolderExist) {
        await fsAsync.mkdir(this._templateSquidFolder);
      }

      const checkSquidVolumeFolderExist = await this._checkFolderExist(this._squidVolumeFolder);
      if (!checkSquidVolumeFolderExist) {
        await fsAsync.mkdir(this._squidVolumeFolder);
      }

      const checkSquidPasswordFileExist = await this._checkFolderExist(this._squidPasswordFile);
      if (!checkSquidPasswordFileExist) {
        const fd = await fsAsync.open(this._squidPasswordFile, 'w');
        await fd.close();
      }

      const checkSquidIpAccessFileExist = await this._checkFolderExist(this._squidIpAccessFile);
      if (!checkSquidIpAccessFileExist) {
        const fd = await fsAsync.open(this._squidIpAccessFile, 'w');
        await fd.close();
      }
    }

    return {
      squidVolumeFolder: this._squidVolumeFolder,
      squidPasswordFile: this._squidPasswordFile,
      squidIpAccessFile: this._squidIpAccessFile,
      squidIpAccessBashFile: this._squidIpAccessBashFile,
      squidConfFolder: this._templateSquidConfFolder,
    };
  }

  async _checkFolderExist(folderPath) {
    try {
      await fsAsync.access(folderPath, fs.constants.F_OK | fs.constants.R_OK);

      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }

      throw error;
    }
  }
}

module.exports = FileUtil;
