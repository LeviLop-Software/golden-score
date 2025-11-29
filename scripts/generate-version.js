#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
);

// Generate version.js
const versionContent = `// This file is auto-generated during build
// Do not edit manually
export const APP_VERSION = '${packageJson.version}';
`;

// Write to src/lib/version.js
const versionPath = path.join(__dirname, '..', 'src', 'lib', 'version.js');
fs.writeFileSync(versionPath, versionContent);

console.log(`✅ Generated version.js with version: ${packageJson.version}`);
