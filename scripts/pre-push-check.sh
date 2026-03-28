#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────
# Pre-push quality gate
# Runs lint, typecheck, and tests before allowing push
# ─────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()   { echo -e "${GREEN}[pre-push]${NC} $1"; }
warn()  { echo -e "${YELLOW}[pre-push]${NC} $1"; }
error() { echo -e "${RED}[pre-push]${NC} $1" >&2; }

FAILED=0

run_check() {
  local name="$1"
  shift
  log "Running $name..."
  if "$@" >/dev/null 2>&1; then
    log "  $name passed"
  else
    error "  $name FAILED"
    FAILED=1
  fi
}

run_check "lint"      npm run lint
run_check "typecheck" npm run typecheck
run_check "tests"     npm run test

if [ "$FAILED" -ne 0 ]; then
  echo ""
  error "Pre-push checks failed. Fix the issues above before pushing."
  error "To bypass (not recommended): git push --no-verify"
  exit 1
fi

echo ""
log "All checks passed — push allowed."
