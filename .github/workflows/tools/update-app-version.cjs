#!/usr/bin/env node

const { existsSync, readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');

const [, , version] = process.argv;

if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('Usage: node update-app-version.cjs <version>');
  process.exit(1);
}

const projectRoot = process.cwd();
const appVersionPath = path.join(projectRoot, 'src', 'APP_VERSION.ts');

if (!existsSync(appVersionPath)) {
  console.error(`APP_VERSION file not found at ${appVersionPath}`);
  process.exit(1);
}

const expectedLine = `export const APP_VERSION = '${version}';`;

let currentContent;
try {
  currentContent = readFileSync(appVersionPath, 'utf-8').replace(/\r\n/g, '\n').trim();
} catch (error) {
  console.error(`Unable to read ${appVersionPath}:`, error.message);
  process.exit(1);
}

if (currentContent === expectedLine) {
  console.log(`APP_VERSION.ts already set to ${version}.`);
  process.exit(0);
}

try {
  writeFileSync(appVersionPath, `${expectedLine}\n`, 'utf-8');
  console.log(`Updated APP_VERSION.ts to ${version}.`);
} catch (error) {
  console.error(`Unable to update ${appVersionPath}:`, error.message);
  process.exit(1);
}
