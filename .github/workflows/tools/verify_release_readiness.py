#!/usr/bin/env python3
"""Validate release assets, commit message, and push state."""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path


SEMVER_PATTERN = re.compile(r"^\d+\.\d+\.\d+$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Verify release files and git state.")
    parser.add_argument("version", help="Version in the format X.Y.Z")
    parser.add_argument("version_name", help="Human readable release name")
    return parser.parse_args()


def validate_inputs(version: str, version_name: str) -> tuple[str, str]:
    clean_version = version.strip()
    clean_name = version_name.strip()

    if not SEMVER_PATTERN.match(clean_version):
        raise ValueError("Version must match X.Y.Z (semantic version).")
    if not clean_name:
        raise ValueError("Version name is required.")
    return clean_version, clean_name


def read_app_version(expected_line: str, path: Path) -> None:
    if not path.exists():
        raise FileNotFoundError(f"APP_VERSION file not found at {path}")

    try:
        content = path.read_text(encoding="utf-8").replace("\r\n", "\n").strip()
    except OSError as exc:
        raise OSError(f"Unable to read {path}: {exc}") from exc

    if content != expected_line:
        raise ValueError(f'APP_VERSION.ts must contain "{expected_line}" but found "{content}".')


def read_changelog(version: str, version_name: str, path: Path) -> None:
    if not path.exists():
        raise FileNotFoundError(f"Changelog file not found at {path}")

    try:
        content = path.read_text(encoding="utf-8").lstrip("\ufeff").replace("\r\n", "\n")
    except OSError as exc:
        raise OSError(f"Unable to read {path}: {exc}") from exc

    header = f"## {version} - {version_name} ("
    start_index = content.find(header)
    if start_index == -1:
        raise ValueError(f'Changelog entry for version {version} with name "{version_name}" not found.')

    body_start = content.find("\n", start_index)
    next_header = content.find("\n## ", body_start + 1)
    entry_body = content[body_start + 1 :] if next_header == -1 else content[body_start + 1 : next_header]

    if not entry_body.strip():
        raise ValueError(f"Changelog entry for version {version} is missing content.")

    if not any(line.strip().startswith("- ") for line in entry_body.splitlines()):
        raise ValueError(f"Changelog entry for version {version} is missing bullet items.")


def ensure_clean_worktree() -> None:
    status = run_git("status", "--porcelain")
    if status:
        raise RuntimeError("Working tree has uncommitted changes:\n" + status)


def ensure_commit_message(expected_message: str) -> None:
    message = run_git("log", "-1", "--pretty=%B").strip()
    if message != expected_message:
        raise RuntimeError(
            "Latest commit message does not match expected push message.\n"
            f"Expected: {expected_message}\nFound: {message}"
        )


def ensure_pushed_upstream() -> None:
    try:
        upstream = run_git("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}")
    except RuntimeError as exc:
        raise RuntimeError("Current branch has no upstream. Ensure the branch was pushed.") from exc

    _ = upstream  # upstream value only used to detect absence
    # Refresh remote information quietly; ignore failure to keep earlier push result.
    subprocess.run(["git", "fetch", "--quiet"], check=False)
    counts = run_git("rev-list", "--left-right", "--count", "HEAD...@{u}")
    ahead, behind = [int(part) for part in counts.replace("\t", " ").split()[:2]]
    if ahead or behind:
        raise RuntimeError(
            "Local branch is not in sync with upstream after push "
            f"(ahead: {ahead}, behind: {behind}). Ensure changes were pushed."
        )


def run_git(*args: str) -> str:
    result = subprocess.run(
        ["git", *args],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or f"git {' '.join(args)} failed")
    return result.stdout.strip()


def main() -> int:
    try:
        args = parse_args()
        version, version_name = validate_inputs(args.version, args.version_name)

        expected_line = f"export const APP_VERSION = '{version}';"
        app_version_path = Path.cwd() / "src" / "APP_VERSION.ts"
        changelog_path = Path.cwd() / "documentation" / "CHANGELOG.md"

        read_app_version(expected_line, app_version_path)
        read_changelog(version, version_name, changelog_path)

        expected_message = f"[workflow-release] v{version} - {version_name}"
        ensure_commit_message(expected_message)
        ensure_clean_worktree()
        ensure_pushed_upstream()

        print(f"Release files and push verified for version {version}.")
    except Exception as exc:  # noqa: BLE001
        print(exc, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
