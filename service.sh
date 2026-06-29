#!/system/bin/sh

MODDIR=${0%/*}
LOG="$MODDIR/debug.log"

[ -f "$LOG" ] && mv -f "$LOG" "$LOG.prev"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [service.sh] === BOOT === device started" > "$LOG"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [service.sh] module dir: $MODDIR" >> "$LOG"
