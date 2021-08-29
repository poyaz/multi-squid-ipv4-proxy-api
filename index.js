/**
 * Created by pooya on 8/29/21.
 */

const Loader = require('./app/loader');
const packageInfo = require('./package.json');

const loader = new Loader({
  cwd: __dirname,
  name: packageInfo.name,
  version: packageInfo.version,
});

loader.start().catch((error) => {
  console.error(error);
  process.exit(1);
});
