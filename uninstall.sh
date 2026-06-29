#!/system/bin/sh

MODDIR=${0%/*}

rm -f /data/local/tmp/com.google.android.gms-*.apk 2>/dev/null
rm -f /data/local/tmp/com.android.vending-*.apk 2>/dev/null
rm -f /data/local/tmp/org.microg.gms-*.apk 2>/dev/null
rm -f "$MODDIR/module.zip" "$MODDIR/debug.log" "$MODDIR/debug.log.prev" 2>/dev/null
