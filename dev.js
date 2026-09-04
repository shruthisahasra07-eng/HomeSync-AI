const { spawn } = require('child_process');
const path = require('path');

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════');
console.log('\x1b[36m%s\x1b[0m', '       🚀 Starting HomeSync (Backend + Frontend)       ');
console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════\n');

// Prefix log helper
function pipeOutput(child, prefix, colorCode) {
  const formatData = (data) => {
    const lines = data.toString().split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().length > 0) {
        process.stdout.write(`\x1b[${colorCode}m[${prefix}]\x1b[0m ${line}\n`);
      }
    }
  };

  child.stdout.on('data', formatData);
  child.stderr.on('data', formatData);
}

// Start backend
const backend = spawn('node', ['server.js'], {
  cwd: backendDir,
  env: process.env,
  shell: false
});
pipeOutput(backend, 'backend', '34'); // Blue

// Start frontend
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: frontendDir,
  env: process.env,
  shell: isWindows
});
pipeOutput(frontend, 'frontend', '32'); // Green

let isShuttingDown = false;
function shutdown(code = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('\n\x1b[33mStopping HomeSync services...\x1b[0m');

  try {
    if (backend && !backend.killed) backend.kill('SIGINT');
  } catch (_) {}

  try {
    if (frontend && !frontend.killed) frontend.kill('SIGINT');
  } catch (_) {}

  setTimeout(() => {
    try {
      if (backend && !backend.killed) backend.kill('SIGKILL');
      if (frontend && !frontend.killed) frontend.kill('SIGKILL');
    } catch (_) {}
    process.exit(code);
  }, 1500);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('exit', () => shutdown(0));

backend.on('error', (err) => {
  console.error(`\x1b[31m[backend error]\x1b[0m ${err.message}`);
});

frontend.on('error', (err) => {
  console.error(`\x1b[31m[frontend error]\x1b[0m ${err.message}`);
});

backend.on('close', (code) => {
  if (!isShuttingDown && code !== 0) {
    console.error(`\x1b[31m[backend exited with code ${code}]\x1b[0m`);
  }
});

frontend.on('close', (code) => {
  if (!isShuttingDown && code !== 0) {
    console.error(`\x1b[31m[frontend exited with code ${code}]\x1b[0m`);
  }
});
