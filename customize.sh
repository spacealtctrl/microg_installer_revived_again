#!/system/bin/sh

DEBUG_LOG="/data/adb/modules/microg_installer_revived_again/debug.log"
debug_log() {
  [ -f "/data/adb/modules/microg_installer_revived_again/debug_logging_enabled" ] || return
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [customize.sh] $1" >> "$DEBUG_LOG" 2>/dev/null
}

debug_log "=== customize.sh START ==="
debug_log "ZIPFILE=$ZIPFILE"
debug_log "MODPATH=$MODPATH"
debug_log "BOOTMODE=$BOOTMODE"

if [ -n "$MMM_EXT_SUPPORT" ]; then
  ui_print "#!useExt"
  mmm_exec() {
    ui_print "$(echo "#!$@")"
  }
else
  mmm_exec() { true; }
fi
debug_log "✓ MMM_EXT_SUPPORT=$MMM_EXT_SUPPORT"

if ! $BOOTMODE; then
    debug_log "✗ ABORT: not in BOOTMODE"
    abort "- ERROR: Installation via recovery is NOT supported."
fi

mmm_exec setSupportLink "https://github.com/spacealtctrl/microg_installer_revived_again/issues"
mmm_exec showLoading

ui_print " "
ui_print "==================================="
ui_print "  microG Installer Revived.... again"
ui_print "  v1.0.0-0"
ui_print "==================================="
ui_print " "

cp "$ZIPFILE" "$MODPATH/module.zip"
debug_log "✓ copied zip to $MODPATH/module.zip (exit=$?)"

if [ -f "/data/adb/modules/microg_installer_revived_again/settings.json" ]; then
    cp "/data/adb/modules/microg_installer_revived_again/settings.json" "$MODPATH/settings.json"
    debug_log "✓ preserved settings.json"
fi

if [ -f "/data/adb/modules/microg_installer_revived_again/debug_logging_enabled" ]; then
    touch "$MODPATH/debug_logging_enabled"
    debug_log "✓ preserved debug_logging_enabled"
fi

if [ -d "/my_bigball/priv-app/GmsCore" ]; then
  GMS_DEST="$MODPATH/system/priv-app/microG"
  GMS_APK="microG.apk"
  VD_DEST="$MODPATH/system/priv-app/Phonesky"
  debug_log "✓ device layout: legacy /my_bigball"
else
  GMS_DEST="$MODPATH/system/product/priv-app/GmsCore"
  GMS_APK="GmsCore.apk"
  VD_DEST="$MODPATH/system/product/priv-app/Phonesky"
  debug_log "✓ device layout: standard product/priv-app"
fi
debug_log "✓ GMS_DEST=$GMS_DEST GMS_APK=$GMS_APK VD_DEST=$VD_DEST"


GMS_PATH=""
GMS_VERN=""
GMS_READY=false

VD_PATH=""
VD_VERN=""
VD_IS_COMPANION=false
VD_READY=false

ui_print " "
ui_print "→ Checking com.google.android.gms..."
DUMP_GMS="$(pm dump com.google.android.gms 2>/dev/null)"
debug_log "✓ pm dump com.google.android.gms: ${#DUMP_GMS} chars"
if [ -z "$DUMP_GMS" ] || (echo "$DUMP_GMS" | grep "Unable to find package") >/dev/null; then
    ui_print "  ⚠ Not installed"
    debug_log "✓ GmsCore: NOT INSTALLED"
elif ! (echo "$DUMP_GMS" | grep "android.permission.FAKE_PACKAGE_SIGNATURE") >/dev/null; then
    ui_print "  ✗ Google Play Services detected (not microG)"
    debug_log "✓ GmsCore: REAL Google Play Services (no FAKE_PACKAGE_SIGNATURE)"
else
    GMS_VERN="$(echo "$DUMP_GMS" | grep versionName | head -n1 | cut -d" " -f5 | cut -d= -f2)"
    GMS_PATH="$(realpath $(echo "$DUMP_GMS" | grep path: | head -n1 | cut -d: -f2))"
    debug_log "✓ GmsCore: version=$GMS_VERN path=$GMS_PATH"
    if [ -n "$GMS_PATH" ] && [ -f "$GMS_PATH" ]; then
        ui_print "  ✓ microG GmsCore v$GMS_VERN"
        GMS_READY=true
        debug_log "✓ GmsCore: READY for promote"
    else
        ui_print "  ⚠ microG GmsCore v$GMS_VERN (APK not found)"
        debug_log "✓ GmsCore: APK FILE NOT FOUND at $GMS_PATH"
    fi
fi

ui_print " "
ui_print "→ Checking com.android.vending..."
DUMP_VD="$(pm dump com.android.vending 2>/dev/null)"
debug_log "✓ pm dump com.android.vending: ${#DUMP_VD} chars"
if [ -z "$DUMP_VD" ] || (echo "$DUMP_VD" | grep "Unable to find package") >/dev/null; then
    ui_print "  ⚠ Not installed"
    debug_log "✓ Vending: NOT INSTALLED"
else
    VD_VERN="$(echo "$DUMP_VD" | grep versionName | head -n1 | cut -d" " -f5 | cut -d= -f2)"
    VD_PATH="$(realpath $(echo "$DUMP_VD" | grep path: | head -n1 | cut -d: -f2))"
    debug_log "✓ Vending: version=$VD_VERN path=$VD_PATH"
    if [ -n "$VD_PATH" ] && [ -f "$VD_PATH" ]; then
        if case "$VD_VERN" in v0*|0*) true;; *) false;; esac; then
            ui_print "  ✓ microG Companion v$VD_VERN"
            VD_IS_COMPANION=true
            debug_log "✓ Vending: microG Companion v$VD_VERN"
        else
            ui_print "  ✓ Play Store v$VD_VERN"
            debug_log "✓ Vending: Play Store v$VD_VERN"
        fi
        VD_READY=true
        debug_log "✓ Vending: READY for promote"
    else
        ui_print "  ⚠ Vending v$VD_VERN (APK not found)"
        debug_log "✓ Vending: APK FILE NOT FOUND at $VD_PATH"
    fi
fi


ui_print " "
if $GMS_READY && $VD_READY; then
    debug_log "✓ Both apps detected — promoting both"
    ui_print "→ Promoting both apps to system priv-app..."

    mkdir -p "$GMS_DEST"
    cp -f "$GMS_PATH" "$GMS_DEST/$GMS_APK"
    debug_log "✓ GmsCore: PROMOTED cp $GMS_PATH → $GMS_DEST/$GMS_APK (exit=$?)"
    ui_print "  ✓ GmsCore promoted"

    mkdir -p "$VD_DEST"
    cp -f "$VD_PATH" "$VD_DEST/Phonesky.apk"
    debug_log "✓ Vending: PROMOTED cp $VD_PATH → $VD_DEST/Phonesky.apk (exit=$?)"
    ui_print "  ✓ Vending promoted"

    if (echo "$DUMP_VD" | grep "android.permission.FAKE_PACKAGE_SIGNATURE") >/dev/null; then
        pm grant com.android.vending android.permission.FAKE_PACKAGE_SIGNATURE 2>/dev/null
        debug_log "✓ Vending: granted FAKE_PACKAGE_SIGNATURE (exit=$?)"
    fi
else
    if ! $GMS_READY && ! $VD_READY; then
        ui_print "  ⚠ Neither app detected — nothing to promote"
        debug_log "✓ SKIP promote: neither GmsCore nor Vending ready"
    elif ! $GMS_READY; then
        ui_print "  ⚠ GmsCore missing — both apps required, skipping promote"
        debug_log "✓ SKIP promote: GmsCore not ready (Vending is ready)"
    else
        ui_print "  ⚠ Vending missing — both apps required, skipping promote"
        debug_log "✓ SKIP promote: Vending not ready (GmsCore is ready)"
    fi
fi

ui_print " "
ui_print "==================================="
ui_print "  Module installed."
ui_print "  Use the WebUI to manage microG."
ui_print "==================================="
ui_print " "

debug_log "✓ === customize.sh DONE ==="
mmm_exec hideLoading
