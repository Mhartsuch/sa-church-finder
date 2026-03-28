#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────
# SA Church Finder — Health Check Script
#
# Usage:
#   ./scripts/health-check.sh                    # check default (localhost:3001)
#   ./scripts/health-check.sh https://api.example.com
# ─────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL="${1:-http://localhost:3001}"
MAX_RETRIES=5
RETRY_DELAY=5

log()   { echo -e "${GREEN}[health]${NC} $1"; }
warn()  { echo -e "${YELLOW}[health]${NC} $1"; }
error() { echo -e "${RED}[health]${NC} $1" >&2; }

log "Checking: $API_URL"

PASS=0
FAIL=0

check_endpoint() {
  local name="$1"
  local url="$2"
  local expected_status="${3:-200}"

  for i in $(seq 1 $MAX_RETRIES); do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    if [ "$STATUS" = "$expected_status" ]; then
      log "  PASS  $name ($STATUS)"
      PASS=$((PASS + 1))
      return 0
    fi
    if [ "$i" -lt "$MAX_RETRIES" ]; then
      warn "  RETRY $name (got $STATUS, expected $expected_status) — attempt $i/$MAX_RETRIES"
      sleep $RETRY_DELAY
    fi
  done

  error "  FAIL  $name (got $STATUS, expected $expected_status)"
  FAIL=$((FAIL + 1))
  return 1
}

echo ""
log "Running health checks..."
echo ""

# Core API
check_endpoint "API Health"         "$API_URL/api/v1/health" || true
check_endpoint "Churches Endpoint"  "$API_URL/api/v1/churches" || true

echo ""
log "Results: $PASS passed, $FAIL failed"

if [ "$FAIL" -gt 0 ]; then
  error "Health check failed — consider rolling back."
  exit 1
fi

log "All checks passed!"
