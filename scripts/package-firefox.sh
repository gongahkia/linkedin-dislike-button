#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$REPO_ROOT/src"
ARTIFACT_DIR="$REPO_ROOT/submission/firefox"
VERSION="$(jq -r '.version' "$SOURCE_DIR/manifest.json")"
ARTIFACT_PATH="$ARTIFACT_DIR/respectful_reaction_button-$VERSION.zip"
RELATIVE_ARTIFACT_PATH="submission/firefox/respectful_reaction_button-$VERSION.zip"

mkdir -p "$ARTIFACT_DIR"

npx --yes web-ext lint --source-dir "$SOURCE_DIR"
npx --yes web-ext build --overwrite-dest --source-dir "$SOURCE_DIR" --artifacts-dir "$ARTIFACT_DIR"
(
  cd "$REPO_ROOT"
  shasum -a 256 "$RELATIVE_ARTIFACT_PATH" > "$RELATIVE_ARTIFACT_PATH.sha256"
)

printf 'Built Firefox artifact: %s\n' "$ARTIFACT_PATH"
printf 'SHA256 manifest: %s.sha256\n' "$ARTIFACT_PATH"
