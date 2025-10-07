#!/usr/bin/env python3
"""Generate a changelog entry for the given version and name."""

from __future__ import annotations

import argparse
import datetime as dt
import re
import subprocess
import sys
from pathlib import Path
from typing import Iterable, List


SEMVER_PATTERN = re.compile(r"^\d+\.\d+\.\d+$")
PR_VERSION_PATTERN = re.compile(r"\bpr version\b", re.IGNORECASE)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Append a release entry to documentation/CHANGELOG.md.")
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


def try_get_last_tag() -> str | None:
    try:
        tag = run_git("describe", "--tags", "--abbrev=0")
    except RuntimeError:
        return None
    return tag or None


def get_commit_messages(git_range: str | None) -> List[str]:
    args: list[str] = ["log", "--pretty=%s", "--reverse"]
    if git_range:
        args.insert(1, git_range)
    output = run_git(*args)
    return _cleanup_messages(output.splitlines())


def _cleanup_messages(messages: Iterable[str]) -> List[str]:
    seen: set[str] = set()
    cleaned: List[str] = []

    for raw in messages:
        message = raw.strip()
        if not message or PR_VERSION_PATTERN.search(message):
            continue
        if message in seen:
            continue
        seen.add(message)
        cleaned.append(message)
    cleaned.reverse()
    return cleaned


def build_entry(version: str, version_name: str, messages: list[str]) -> tuple[str, str]:
    release_date = dt.date.today().isoformat()
    title = f"## {version} - {version_name} ({release_date})"
    items = "\n".join(f"- {msg}" for msg in messages)
    entry = f"{title}\n\n{items}".strip()
    return title, entry


def write_changelog(title: str, entry: str, changelog_path: Path) -> None:
    header = "# Changelog"
    existing = ""

    if changelog_path.exists():
        existing = changelog_path.read_text(encoding="utf-8").replace("\r\n", "\n").lstrip("\ufeff")
    else:
        changelog_path.parent.mkdir(parents=True, exist_ok=True)
        existing = header

    if title in existing:
        print(f"Changelog already contains an entry for {title}.")
        return

    body = existing[len(header):].strip() if existing.startswith(header) else existing.strip()
    combined = f"{entry}\n\n{body}".strip() if body else entry
    changelog_path.write_text(f"{header}\n\n{combined}\n", encoding="utf-8")
    print(f"Changelog updated for version {title}.")


def main() -> int:
    try:
        args = parse_args()
        version, version_name = validate_inputs(args.version, args.version_name)
        last_tag = try_get_last_tag()
        commit_range = f"{last_tag}..HEAD" if last_tag else None
        messages = get_commit_messages(commit_range)

        if not messages:
            print(f"No new commit messages found for changelog (version {version}).")
            return 0

        title, entry = build_entry(version, version_name, messages)
        changelog_path = Path.cwd() / "documentation" / "CHANGELOG.md"
        write_changelog(title, entry, changelog_path)
    except Exception as exc:  # noqa: BLE001
        print(exc, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
