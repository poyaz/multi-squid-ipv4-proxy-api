/**
 * Created by pooya on 8/30/21.
 */

const fs = require('fs');
const fsAsync = require('fs/promises');
const path = require('path');
const { spawn } = require('child_process');
const IProxyServerRepository = require('~src/core/interface/iProxyServerRepository');
const CommandExecuteException = require('~src/core/exception/commandExecuteException');

class SquidServerRepository extends IProxyServerRepository {
  /**
   * @type {Docker}
   */
  #docker;
  /**
   * @type {Object<{host: string, current: string}>}
   */
  #projectPath;
  /**
   * @type {string}
   */
  #defaultSquidConfigFolder;
  /**
   * @type {string}
   */
  #squidPasswordFile;
  /**
   * @type {string}
   */
  #squidIpAccessFile;
  /**
   * @type {string}
   */
  #squidIpAccessBashFile;
  /**
   * @type {string}
   */
  #squidVolumePerInstanceFolder;
  /**
   * @type {number}
   */
  #ipCountPerInstance;
  /**
   * @type {string}
   */
  #apiUrl;
  /**
   * @type {string}
   */
  #apiToken;
  /**
   * @type {Array<string>}
   */
  #defaultConfig;
  /**
   * @type {string}
   */
  #squidOtherConfDir = '/tmp/squid';
  /**
   * @type {number|null}
   */
  #overrideSquidPort = null;

  /**
   *
   * @param {Docker} docker
   * @param {Object<{host: string, current: string}>} projectPath
   * @param {string} defaultSquidConfigFolder
   * @param {string} squidPasswordFile
   * @param {string} squidIpAccessFile
   * @param {string} squidIpAccessBashFile
   * @param {string} squidVolumePerInstanceFolder
   * @param {number} ipCountPerInstance
   * @param {string} apiUrl
   * @param {string} apiToken
   * @param {number|null} overrideSquidPort
   */
  constructor(
    docker,
    projectPath,
    defaultSquidConfigFolder,
    squidPasswordFile,
    squidIpAccessFile,
    squidIpAccessBashFile,
    squidVolumePerInstanceFolder,
    ipCountPerInstance,
    apiUrl,
    apiToken,
    overrideSquidPort = 0,
  ) {
    super();

    this.#docker = docker;
    this.#projectPath = projectPath;
    this.#defaultSquidConfigFolder = defaultSquidConfigFolder;
    this.#squidPasswordFile = squidPasswordFile;
    this.#squidIpAccessFile = squidIpAccessFile;
    this.#squidIpAccessBashFile = squidIpAccessBashFile;
    this.#squidVolumePerInstanceFolder = squidVolumePerInstanceFolder;
    this.#ipCountPerInstance = ipCountPerInstance;
    this.#apiUrl = apiUrl;
    this.#apiToken = apiToken;
    this.#overrideSquidPort = overrideSquidPort;

    const squidOtherConfDir = this.#squidOtherConfDir;
    this.#defaultConfig = [
      `visible_hostname localhost`,
      ``,
      `dns_nameservers 1.1.1.1`,
      `dns_v4_first on`,
      `cache deny all`,
      ``,
      `acl localnet src all`,
      `acl CONNECT method CONNECT`,
      ``,
      `auth_param basic program /usr/lib/squid/basic_ncsa_auth ${squidOtherConfDir}/squid-pwd.htpasswd`,
      `auth_param basic children 100`,
      `auth_param basic credentialsttl 10 seconds`,
      ``,
      `external_acl_type user_ip_access %MYADDR %LOGIN /usr/lib/squid/ext_file_userip_acl -f ${squidOtherConfDir}/squid-user-ip.conf`,
      `external_acl_type user_block_url ttl=0 negative_ttl=0 %LOGIN %DST /tmp/squid-block-url.sh`,
      ``,
      `acl ncsa_users proxy_auth REQUIRED`,
      `acl user_ip_access external user_ip_access`,
      `acl user_block_url external user_block_url`,
      ``,
      `http_access deny !ncsa_users`,
      `http_access deny user_block_url`,
      `http_access allow user_ip_access`,
      `http_access deny all`,
      ``,
    ];
  }

  async reload() {
    try {
      const getCurrentContainerList = await this.#docker.listContainers(
        {
          all: true,
          filters: { label: ['com.multi.squid.ipv4.proxy.api=squid'] },
        },
        undefined,
      );

      for await (const item of getCurrentContainerList) {
        const container = this.#docker.getContainer(item.Id);
        await container.kill({ signal: 'HUP' }, undefined);
      }

      return [null];
    } catch (error) {
      return [new CommandExecuteException(error)];
    }
  }

  async add(models) {
    const totalContainerCount = Math.ceil(models.length / this.#ipCountPerInstance);
    const ipModelList = [];

    models.map((v) => ipModelList.push(v.clone()));

    try {
      const getCurrentContainerList = await this.#docker.listContainers(
        {
          all: true,
          filters: { label: ['com.multi.squid.ipv4.proxy.api=squid'] },
        },
        undefined,
      );

      for await (const item of getCurrentContainerList) {
        const container = this.#docker.getContainer(item.Id);
        await container.remove({ v: true, force: true }, undefined);
      }

      const containerInstanceList = new Array(totalContainerCount).fill(null).map((v, i) => i);

      for await (const i of containerInstanceList) {
        const containerPath = `${this.#squidVolumePerInstanceFolder}${path.sep}squid${i}`;

        const haExistContainerVolume = await this._checkDirectoryExist(containerPath);
        if (!haExistContainerVolume) {
          await fsAsync.mkdir(containerPath);
        }

        const exec = spawn('cp', [
          '-f',
          '-r',
          `${this.#defaultSquidConfigFolder}${path.sep}.`,
          containerPath,
        ]);
        let executeError = '';
        for await (const chunk of exec.stderr) {
          executeError += chunk;
        }
        if (executeError) {
          return [new CommandExecuteException(new Error(executeError))];
        }

        const squidConfigDataList = [...this.#defaultConfig];

        squidConfigDataList.push(`### IP bind block start`);
        squidConfigDataList.push(``);

        ipModelList.splice(0, this.#ipCountPerInstance).map((model, index) => {
          const squidPort = this.#overrideSquidPort ? this.#overrideSquidPort : model.port || 3128;

          squidConfigDataList.push(`http_port ${model.ip}:${squidPort} name=http${index}`);
          squidConfigDataList.push(`acl ip${index} myportname http${index}`);
          squidConfigDataList.push(`tcp_outgoing_address ${model.ip} ip${index}`);
          squidConfigDataList.push(``);
        });

        squidConfigDataList.push(`### IP bind block end`);
        squidConfigDataList.push(``);

        await fsAsync.writeFile(
          `${containerPath}${path.sep}squid.conf`,
          squidConfigDataList.join('\n'),
          {
            encoding: 'utf8',
            flag: 'w',
          },
        );

        const containerPathVolume = containerPath.replace(
          this.#projectPath.current,
          this.#projectPath.host,
        );
        const squidOtherConfDir = path.dirname(
          this.#squidPasswordFile.replace(this.#projectPath.current, this.#projectPath.host),
        );
        const squidIpAccessBashFileVolume = this.#squidIpAccessBashFile.replace(
          this.#projectPath.current,
          this.#projectPath.host,
        );
        const container = await this.#docker.createContainer(
          {
            Image: 'multi-squid-ipv4-proxy-api:latest',
            name: `multi-squid-ipv4-proxy-api_squid-${i}`,
            Labels: { 'com.multi.squid.ipv4.proxy.api': 'squid' },
            Env: [
              `API_URL=${this.#apiUrl}`,
              `API_TOKEN=${this.#apiToken}`,
              `SQUID_BLOCK_URL_BASH=/tmp/squid-block-url.sh`,
            ],
            HostConfig: {
              Binds: [
                `/etc/localtime:/etc/localtime:ro`,
                `${containerPathVolume}:/etc/squid`,
                `${squidOtherConfDir}:${this.#squidOtherConfDir}`,
                `${squidIpAccessBashFileVolume}:/tmp/squid-block-url.sh`,
              ],
              NetworkMode: 'host',
              RestartPolicy: {
                Name: 'always',
              },
            },
          },
          undefined,
        );
        await container.start();
      }

      return [null, models];
    } catch (error) {
      return [new CommandExecuteException(error)];
    }
  }

  async _checkDirectoryExist(fileDir) {
    try {
      await fsAsync.access(fileDir, fs.constants.F_OK | fs.constants.R_OK);

      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }

      throw error;
    }
  }
}

module.exports = SquidServerRepository;
