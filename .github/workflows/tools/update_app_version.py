#!/usr/bin/env python3
"""Update the APP_VERSION.ts file with the provided semantic version."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


SEMVER_PATTERN = re.compile(r"^\d+\.\d+\.\d+$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Update src/APP_VERSION.ts with the given version.")
    parser.add_argument("version", help="Version in the format X.Y.Z")
    return parser.parse_args()


def validate_version(raw_version: str) -> str:
    version = raw_version.strip()
    if not SEMVER_PATTERN.match(version):
        raise ValueError("Version must match X.Y.Z (semantic version).")
    return version


def update_app_version(version: str) -> None:
    app_version_path = Path.cwd() / "src" / "APP_VERSION.ts"

    if not app_version_path.exists():
        raise FileNotFoundError(f"APP_VERSION file not found at {app_version_path}")

    expected_line = f"export const APP_VERSION = '{version}';"

    try:
        current_content = app_version_path.read_text(encoding="utf-8").replace("\r\n", "\n").strip()
    except OSError as exc:
        raise OSError(f"Unable to read {app_version_path}: {exc}") from exc

    if current_content == expected_line:
        print(f"APP_VERSION.ts already set to {version}.")
        return

    try:
        app_version_path.write_text(f"{expected_line}\n", encoding="utf-8")
    except OSError as exc:
        raise OSError(f"Unable to update {app_version_path}: {exc}") from exc

    print(f"Updated APP_VERSION.ts to {version}.")


def main() -> int:
    try:
        args = parse_args()
        version = validate_version(args.version)
        update_app_version(version)
    except Exception as exc:  # noqa: BLE001 - surface friendly error
        print(exc, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

