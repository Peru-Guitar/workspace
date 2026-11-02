#!/usr/bin/env bash
# Clones the Peru Guitar apps next to this workspace. Folders that already exist are left untouched.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ORG="https://github.com/Peru-Guitar"
failed=0

for app in pg-web pg-fretquest pg-fighters; do
  if [ -e "$ROOT/$app" ]; then
    echo "skip   $app (already exists)"
  elif git clone "$ORG/$app.git" "$ROOT/$app"; then
    echo "cloned $app"
  else
    echo "failed $app" >&2
    failed=1
  fi
done

exit "$failed"
