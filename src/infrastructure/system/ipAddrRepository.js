/**
 * Created by pooya on 8/31/21.
 */

const { spawn } = require('child_process');
const IProxyServerRepository = require('~src/core/interface/iProxyServerRepository');
const CommandExecuteException = require('~src/core/exception/commandExecuteException');

class IpAddrRepository extends IProxyServerRepository {
  async add(models) {
    const [model] = models;

    try {
      const findIpExistExec = spawn('sh', [
        `-c`,
        `ip -4 addr | awk '{print $2}' | grep -oE '\\b([0-9]{1,3}\\.){3}[0-9]{1,3}\\b' | grep ${model.ip} | wc -l`,
      ]);
      let findIpExistExecuteError = '';
      for await (const chunk of findIpExistExec.stderr) {
        findIpExistExecuteError += chunk;
      }
      if (findIpExistExecuteError) {
        return [new CommandExecuteException(new Error(findIpExistExecuteError))];
      }

      let ipExistExecuteData = '';
      for await (const chunk of findIpExistExec.stdout) {
        ipExistExecuteData += chunk;
      }
      ipExistExecuteData = Number(ipExistExecuteData);
      if (!isNaN(ipExistExecuteData) && ipExistExecuteData > 0) {
        return [null, []];
      }

      const addIpExec = spawn('ip', [
        '-4',
        'addr',
        'add',
        `${model.ip}/${model.mask}`,
        'dev',
        model.interface,
      ]);
      let addIpExecuteError = '';
      for await (const chunk of addIpExec.stderr) {
        addIpExecuteError += chunk;
      }
      if (addIpExecuteError) {
        return [new CommandExecuteException(new Error(addIpExecuteError))];
      }

      return [null, [model]];
    } catch (error) {
      return [new CommandExecuteException(error)];
    }
  }
}

module.exports = IpAddrRepository;
