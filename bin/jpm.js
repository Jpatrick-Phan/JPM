#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// Determine the script to run based on OS
const isWindows = os.platform() === 'win32';
const scriptName = isWindows ? 'jpm.cmd' : 'jpm.sh';

// Path to the actual script inside the package
// Assuming structure: node_modules/jpm-cli/bin/jpm.js -> ../.jpm/scripts/jpm.sh
const scriptPath = path.join(__dirname, '..', '.jpm', 'scripts', scriptName);

const args = process.argv.slice(2);

const child = spawn(scriptPath, args, {
  stdio: 'inherit',
  shell: isWindows // Use shell on Windows to execute .cmd
});

child.on('exit', (code) => {
  process.exit(code);
});
