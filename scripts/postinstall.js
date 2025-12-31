const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('JPM: Setting up permissions...');

const scriptsDir = path.join(__dirname, '..', '.jpm', 'scripts');

if (fs.existsSync(scriptsDir)) {
  const files = fs.readdirSync(scriptsDir);
  files.forEach(file => {
    if (file.endsWith('.sh')) {
      const filePath = path.join(scriptsDir, file);
      try {
        fs.chmodSync(filePath, '755');
        console.log(`Made executable: ${file}`);
      } catch (err) {
        console.warn(`Warning: Could not chmod ${file} (might be on Windows)`);
      }
    }
  });
}

console.log('JPM installed successfully!');
