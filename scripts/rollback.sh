#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────
# SA Church Finder — Rollback Script
#
# Usage:
#   ./scripts/rollback.sh              # interactive: pick from recent tags
#   ./scripts/rollback.sh v20260327-abc1234  # rollback to specific tag
#   ./scripts/rollback.sh --last       # rollback to the previous release tag
# ─────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()   { echo -e "${GREEN}[rollback]${NC} $1"; }
warn()  { echo -e "${YELLOW}[rollback]${NC} $1"; }
error() { echo -e "${RED}[rollback]${NC} $1" >&2; }

# Ensure we're in a git repo
if ! git rev-parse --is-inside-work-tree &>/dev/null; then
  error "Not inside a git repository."
  exit 1
fi

# Fetch latest tags
git fetch --tags --quiet

# Get release tags sorted by date (newest first)
TAGS=$(git tag --sort=-creatordate | grep -E '^v[0-9]{8}-' | head -10)

if [ -z "$TAGS" ]; then
  error "No release tags found. Nothing to rollback to."
  exit 1
fi

TARGET=""

if [ "${1:-}" = "--last" ]; then
  # Skip the current (first) tag, use the second one
  TARGET=$(echo "$TAGS" | sed -n '2p')
  if [ -z "$TARGET" ]; then
    error "Only one release tag exists. Cannot rollback further."
    exit 1
  fi
elif [ -n "${1:-}" ]; then
  # Validate the provided tag exists
  if ! git rev-parse "$1" &>/dev/null; then
    error "Tag '$1' does not exist."
    exit 1
  fi
  TARGET="$1"
else
  # Interactive selection
  echo ""
  log "Recent release tags:"
  echo ""
  i=1
  while IFS= read -r tag; do
    COMMIT=$(git rev-parse --short "$tag")
    DATE=$(git log -1 --format="%ci" "$tag" 2>/dev/null | cut -d' ' -f1)
    MSG=$(git log -1 --format="%s" "$tag" 2>/dev/null)
    printf "  %s) %s  (%s, %s)  %s\n" "$i" "$tag" "$COMMIT" "$DATE" "$MSG"
    i=$((i + 1))
  done <<< "$TAGS"
  echo ""
  read -rp "Select a tag number to rollback to (or q to quit): " CHOICE

  if [ "$CHOICE" = "q" ]; then
    log "Rollback cancelled."
    exit 0
  fi

  TARGET=$(echo "$TAGS" | sed -n "${CHOICE}p")
  if [ -z "$TARGET" ]; then
    error "Invalid selection."
    exit 1
  fi
fi

COMMIT=$(git rev-parse --short "$TARGET")
log "Rolling back to: $TARGET ($COMMIT)"

# Show what will change
echo ""
warn "Changes that will be reverted:"
git log --oneline "$TARGET..HEAD" | head -20
echo ""

read -rp "Proceed with rollback? (y/N): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  log "Rollback cancelled."
  exit 0
fi

# Create a rollback branch
ROLLBACK_BRANCH="rollback/$TARGET-$(date +%Y%m%d%H%M%S)"
git checkout -b "$ROLLBACK_BRANCH" "$TARGET"

log "Created rollback branch: $ROLLBACK_BRANCH"
log ""
log "Next steps:"
log "  1. Test locally to verify everything works"
log "  2. Push and create a PR:  git push -u origin $ROLLBACK_BRANCH"
log "  3. Or trigger a manual deploy via GitHub Actions:"
log "     gh workflow run deploy.yml -f rollback_to=$COMMIT"
