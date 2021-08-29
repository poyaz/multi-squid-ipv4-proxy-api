/**
 * Created by pooya on 12/2/20.
 */

/**
 * Created by pooya on 7/7/19.
 */

const { spawn } = require('child_process');

npmInstall();

function npmInstall() {
  const exec = spawn('npm', ['install']);
  exec.stdout.pipe(process.stdout);
  exec.stderr.pipe(process.stderr);
  exec.on('exit', (code) => {
    if (code !== 0) {
      return process.exit(code);
    }

    npmPreStart();
  });
}

function npmPreStart() {
  const exec = spawn('npm', ['run', 'prestart']);
  exec.stdout.pipe(process.stdout);
  exec.stderr.pipe(process.stderr);
  exec.on('exit', (code) => {
    if (code !== 0) {
      return process.exit(code);
    }

    startService();
  });
}

function startService() {
  const exec = spawn(
    'node_modules/nodemon/bin/nodemon.js',
    ['--inspect=0.0.0.0:9229', 'index.js'],
    {
      stdio: [process.stdin, process.stdout, process.stderr],
    },
  );

  exec.on('error', (error) => console.error(error));

  exec.on('exit', (code) => process.exit(code));
}
