#!/bin/sh
set -euo pipefail

CONFIG_PATH="${CONFIG_PATH:-/usr/share/nginx/html/assets/settings.json}"
APP_NAME="${APP_NAME:-Demo Playground}"
APP_STORAGE_NAMESPACE="${APP_STORAGE_NAMESPACE:-demo}"

mkdir -p "$(dirname "$CONFIG_PATH")"

jq -n \
  --arg name "$APP_NAME" \
  --arg namespace "$APP_STORAGE_NAMESPACE" \
  '{
    app: {
      name: $name,
      storageNamespace: $namespace
    }
  }' > "$CONFIG_PATH"

exec "$@"
