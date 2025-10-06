#!/usr/bin/env node

const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');

const [, , version, versionNameRaw] = process.argv;

if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('Usage: node verify-release-readiness.cjs <version> <version-name>');
  process.exit(1);
}

const versionName = versionNameRaw && versionNameRaw.trim();
if (!versionName) {
  console.error('Version name is required.');
  process.exit(1);
}

const projectRoot = process.cwd();
const appVersionPath = path.join(projectRoot, 'src', 'APP_VERSION.ts');
const changelogPath = path.join(projectRoot, 'documentation', 'CHANGELOG.md');

if (!existsSync(appVersionPath)) {
  console.error(`APP_VERSION file not found at ${appVersionPath}`);
  process.exit(1);
}

if (!existsSync(changelogPath)) {
  console.error(`Changelog file not found at ${changelogPath}`);
  process.exit(1);
}

const expectedLine = `export const APP_VERSION = '${version}';`;

let appVersionContent;
try {
  appVersionContent = readFileSync(appVersionPath, 'utf-8').replace(/\r\n/g, '\n').trim();
} catch (error) {
  console.error(`Unable to read ${appVersionPath}:`, error.message);
  process.exit(1);
}

if (appVersionContent !== expectedLine) {
  console.error(`APP_VERSION.ts must contain "${expectedLine}" but found "${appVersionContent}".`);
  process.exit(1);
}

let changelogContent;
try {
  changelogContent = readFileSync(changelogPath, 'utf-8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
} catch (error) {
  console.error(`Unable to read ${changelogPath}:`, error.message);
  process.exit(1);
}

const headerNeedle = `## ${version} - ${versionName} (`;
const headerIndex = changelogContent.indexOf(headerNeedle);

if (headerIndex === -1) {
  console.error(`Changelog entry for version ${version} with name "${versionName}" not found.`);
  process.exit(1);
}

const bodyStart = changelogContent.indexOf('\n', headerIndex);
const nextHeaderIndex = changelogContent.indexOf('\n## ', bodyStart + 1);
const entryBody = nextHeaderIndex === -1
  ? changelogContent.slice(bodyStart + 1)
  : changelogContent.slice(bodyStart + 1, nextHeaderIndex);

if (!entryBody.trim()) {
  console.error(`Changelog entry for version ${version} is missing content.`);
  process.exit(1);
}

const hasBullet = entryBody.split('\n').some((line) => line.trim().startsWith('- '));

if (!hasBullet) {
  console.error(`Changelog entry for version ${version} is missing bullet items.`);
  process.exit(1);
}

console.log(`Release files verified for version ${version}.`);
