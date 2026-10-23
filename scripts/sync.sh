#!/usr/bin/env bash
# Clones the missing apps and fast-forwards the existing ones to origin/main.
# Never discards local work: a repo with uncommitted changes or diverged commits is skipped.
set -u
cd "$(dirname "$0")/.."

for repo in pg-web pg-fretquest pg-fighters; do
  if [ ! -d "$repo" ]; then
    echo "→ $repo: cloning"
    git clone -q "https://github.com/Peru-Guitar/$repo.git"
    continue
  fi

  if [ -n "$(git -C "$repo" status --porcelain --untracked-files=no)" ]; then
    echo "⚠ $repo: uncommitted changes, skipped"
    continue
  fi

  if git -C "$repo" pull -q --ff-only origin main; then
    echo "✓ $repo: up to date"
  else
    echo "⚠ $repo: diverged from origin/main, skipped (resolve it by hand)"
  fi
done
