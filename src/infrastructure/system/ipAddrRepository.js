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
        if (/exists/.test(addIpExecuteError)) {
          return [null, []];
        }

        return [new CommandExecuteException(new Error(addIpExecuteError))];
      }

      return [null, [model]];
    } catch (error) {
      return [new CommandExecuteException(error)];
    }
  }
}

module.exports = IpAddrRepository;
