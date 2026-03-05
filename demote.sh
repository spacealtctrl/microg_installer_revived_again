#!/system/bin/sh

MODDIR=/data/adb/modules/microg_installer_revived_again
DEBUG_LOG="$MODDIR/debug.log"

debug_log() {
  [ -f "/data/adb/modules/microg_installer_revived_again/debug_logging_enabled" ] || return
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [demote.sh] $1" >> "$DEBUG_LOG" 2>/dev/null
}

debug_log "=== demote.sh START ==="

debug_log "pre-check: product/GmsCore=$([ -d "$MODDIR/system/product/priv-app/GmsCore" ] && echo EXISTS || echo MISSING)"
debug_log "pre-check: product/Phonesky=$([ -d "$MODDIR/system/product/priv-app/Phonesky" ] && echo EXISTS || echo MISSING)"
debug_log "pre-check: priv-app/microG=$([ -d "$MODDIR/system/priv-app/microG" ] && echo EXISTS || echo MISSING)"
debug_log "pre-check: priv-app/Phonesky=$([ -d "$MODDIR/system/priv-app/Phonesky" ] && echo EXISTS || echo MISSING)"

rm -rf "$MODDIR/system/product/priv-app/GmsCore"
debug_log "✓ removed product/GmsCore (exit=$?)"
rm -rf "$MODDIR/system/product/priv-app/Phonesky"
debug_log "✓ removed product/Phonesky (exit=$?)"
rm -rf "$MODDIR/system/priv-app/microG"
debug_log "✓ removed priv-app/microG (exit=$?)"
rm -rf "$MODDIR/system/priv-app/Phonesky"
debug_log "✓ removed priv-app/Phonesky (exit=$?)"

debug_log "post-check: product/GmsCore=$([ -d "$MODDIR/system/product/priv-app/GmsCore" ] && echo STILL_EXISTS || echo GONE)"
debug_log "post-check: product/Phonesky=$([ -d "$MODDIR/system/product/priv-app/Phonesky" ] && echo STILL_EXISTS || echo GONE)"
debug_log "post-check: priv-app/microG=$([ -d "$MODDIR/system/priv-app/microG" ] && echo STILL_EXISTS || echo GONE)"
debug_log "post-check: priv-app/Phonesky=$([ -d "$MODDIR/system/priv-app/Phonesky" ] && echo STILL_EXISTS || echo GONE)"

debug_log "✓ === demote.sh DONE ==="
echo done
