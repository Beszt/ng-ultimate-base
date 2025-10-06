#!/usr/bin/env node

const { execSync } = require('node:child_process');
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');

const [, , version, versionName] = process.argv;

if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('Usage: node update-changelog.cjs <version> <version-name>');
  process.exit(1);
}

if (!versionName || !versionName.trim()) {
  console.error('Version name is required.');
  process.exit(1);
}

const releaseDate = new Date().toISOString().slice(0, 10);

const projectRoot = process.cwd();
const changelogDir = path.join(projectRoot, 'documentation');
const changelogPath = path.join(changelogDir, 'CHANGELOG.md');

const execOptions = { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] };

function getLastTag() {
  try {
    return execSync('git describe --tags --abbrev=0', execOptions).trim();
  } catch {
    return '';
  }
}

function getCommitMessages(range) {
  const command = range
    ? `git log ${range} --pretty=%s --reverse`
    : 'git log --pretty=%s --reverse';
  const output = execSync(command, execOptions);
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .reverse();
}

const lastTag = getLastTag();
const range = lastTag ? `${lastTag}..HEAD` : '';
let rawMessages;

try {
  rawMessages = getCommitMessages(range);
} catch (error) {
  console.error('Unable to retrieve commit messages for changelog:', error.message);
  process.exit(1);
}

const cleanedMessages = Array.from(
  new Set(
    rawMessages
      .map((message) => message.trim())
      .filter((message) => message.length > 0 && !/\bpr version\b/i.test(message)),
  ),
);

if (cleanedMessages.length === 0) {
  console.log(`No new commit messages found for changelog (version ${version}).`);
  process.exit(0);
}

if (!existsSync(changelogDir)) {
  mkdirSync(changelogDir, { recursive: true });
}

const header = '# Changelog';
const entryTitle = `## ${version} - ${versionName.trim()} (${releaseDate})`;
const entryLines = cleanedMessages.map((message) => `- ${message}`);
const entry = [entryTitle, '', ...entryLines].join('\n');

let existingContent = existsSync(changelogPath)
  ? readFileSync(changelogPath, 'utf-8')
  : `${header}\n`;
let normalizedContent = existingContent.replace(/\r\n/g, '\n').replace(/^\uFEFF/, '');

if (normalizedContent.includes(entryTitle)) {
  console.log(`Changelog already contains an entry for ${entryTitle}.`);
  process.exit(0);
}

const body = normalizedContent.startsWith(header)
  ? normalizedContent.slice(header.length).trimStart()
  : normalizedContent.trim();

const finalBody = body.length > 0 ? `${entry}\n\n${body}` : entry;
const finalContent = `${header}\n\n${finalBody}`.replace(/\s+$/, '') + '\n';

writeFileSync(changelogPath, finalContent, 'utf-8');

console.log(`Changelog updated for version ${version}${lastTag ? ` (since ${lastTag})` : ''}.`);
