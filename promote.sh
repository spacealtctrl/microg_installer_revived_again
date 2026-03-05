#!/system/bin/sh

MODDIR=/data/adb/modules/microg_installer_revived_again
ZIPFILE="$MODDIR/module.zip"
DEBUG_LOG="$MODDIR/debug.log"

debug_log() {
  [ -f "/data/adb/modules/microg_installer_revived_again/debug_logging_enabled" ] || return
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [promote.sh] $1" >> "$DEBUG_LOG" 2>/dev/null
}

debug_log "=== promote.sh START ==="

if [ ! -f "$ZIPFILE" ]; then
  debug_log "✗ ERROR: module.zip not found at $ZIPFILE"
  echo "ERROR: module.zip not found"
  exit 1
fi
debug_log "✓ module.zip found ($(ls -la "$ZIPFILE" 2>/dev/null | awk '{print $5}') bytes)"

if command -v ksud >/dev/null 2>&1; then
  debug_log "✓ using ksud to install module"
  ksud module install "$ZIPFILE"
  debug_log "✓ ksud install exit=$?"
elif command -v magisk >/dev/null 2>&1; then
  debug_log "✓ using magisk to install module"
  magisk --install-module "$ZIPFILE"
  debug_log "✓ magisk install exit=$?"
else
  debug_log "✗ ERROR: no module manager (ksud/magisk) found"
  echo "ERROR: no module manager found"
  exit 1
fi

debug_log "✓ === promote.sh DONE ==="
echo 2
