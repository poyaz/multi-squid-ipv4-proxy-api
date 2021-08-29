/**
 * Created by pooya on 8/29/21.
 */

const Path = require('path');
const Loader = require('../app/loader');

const loader = new Loader({ cwd: Path.resolve(__dirname, '..'), cli: true });

loader.start().catch((error) => {
  console.error(error);
  process.exit(1);
});
