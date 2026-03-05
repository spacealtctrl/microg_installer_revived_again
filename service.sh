#!/system/bin/sh

MODDIR=${0%/*}
LOG="$MODDIR/debug.log"

: > "$LOG"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [service.sh] === BOOT === device started, log reset" >> "$LOG"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [service.sh] ✓ module dir: $MODDIR" >> "$LOG"
