const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const relativeDir = process.argv[2];
if (!relativeDir) {
  console.error('Usage: node scripts/serve-static.js <dist-dir>');
  process.exit(1);
}

const dir = path.resolve(relativeDir);
const port = process.env.PORT || '3000';
const indexPath = path.join(dir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error(`[serve-static] Missing build output: ${indexPath}`);
  console.error(`[serve-static] cwd=${process.cwd()}`);
  const parent = path.dirname(dir);
  if (fs.existsSync(parent)) {
    console.error(`[serve-static] Contents of ${parent}:`, fs.readdirSync(parent));
  }
  process.exit(1);
}

console.log(`[serve-static] Serving ${dir} on 0.0.0.0:${port}`);

const serveBin = require.resolve('serve/build/main.js');
const child = spawn(
  process.execPath,
  [serveBin, dir, '-s', '-l', `tcp://0.0.0.0:${port}`],
  { stdio: 'inherit' },
);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
