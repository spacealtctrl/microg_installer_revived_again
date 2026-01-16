
if [ -n "$MMM_EXT_SUPPORT" ]; then
  ui_print "#!useExt"
  mmm_exec() {
    ui_print "$(echo "#!$@")"
  }
else
  mmm_exec() { true; }
fi

if ! $BOOTMODE; then
    abort "- ERROR: Installation via recovery is NOT supported."
fi

mmm_exec setSupportLink "https://github.com/spacealtctrl/microg_installer_revived_again/issues"

MAX_VER="250932024"
MAX_VERN="0.3.12.250932"

if [ -f /data/adb/Phonesky.apk ]; then
    ui_print "- INFO: Legacy Phonesky.apk found in /data/adb"
    ui_print "  (This file is no longer used by the module)"
fi

mmm_exec showLoading
ui_print " "
ui_print "==================================="
ui_print "  microG Installer Revived.... again"
ui_print "  v5.3.0"
ui_print "==================================="
ui_print " "

ui_print "→ Checking com.google.android.gms..."
DUMP_GMS="$(pm dump com.google.android.gms)"
if [[ $? -gt 0 ]]; then
    ui_print "  ⚠ WARNING: pm dump may have failed"
fi

if (echo "$DUMP_GMS" | grep "Unable to find package: com.google.android.gms") >/dev/null; then
    abort "✗ ERROR: microG GmsCore is not installed"
fi

if ! (echo "$DUMP_GMS" | grep "android.permission.FAKE_PACKAGE_SIGNATURE") >/dev/null; then
    abort "✗ ERROR: Google Play Services detected (microG required)"
fi

GMS_PATH="$(realpath $(echo "$DUMP_GMS" | grep path: | head -n1 | cut -d: -f2))"
ui_print "  ✓ Found at: $GMS_PATH"

if [[ "$GMS_PATH" = "${GMS_PATH#/data/}" ]]; then
    abort "✗ ERROR: microG must be installed on /data, found at $GMS_PATH"
fi

if ! [[ -f "$GMS_PATH" ]]; then
    abort "✗ ERROR: microG APK not found at $GMS_PATH"
fi

GMS_VER="$(echo "$DUMP_GMS" | grep versionCode | head -n1 | cut -d" " -f5 | cut -d= -f2)"
GMS_VERN="$(echo "$DUMP_GMS" | grep versionName | head -n1 | cut -d" " -f5 | cut -d= -f2)"
ui_print "  ✓ Version: $GMS_VERN (code: $GMS_VER)"

if [[ "$GMS_VER" -gt "$MAX_VER" ]]; then
    abort "✗ ERROR: microG $GMS_VERN exceeds max supported $MAX_VERN"
fi

ui_print " "
ui_print "→ Checking com.android.vending..."
DUMP_VD="$(pm dump com.android.vending)"
if [[ $? -gt 0 ]]; then
    ui_print "  ⚠ WARNING: pm dump may have failed"
fi

if (echo "$DUMP_VD" | grep "Unable to find package: com.android.vending") >/dev/null; then
    abort "✗ ERROR: Play Store or microG Companion not installed"
fi

VD_PATH="$(realpath $(echo "$DUMP_VD" | grep path: | head -n1 | cut -d: -f2))"
ui_print "  ✓ Found at: $VD_PATH"

if [[ "$VD_PATH" = "${VD_PATH#/data/}" ]]; then
    abort "✗ ERROR: Vending must be installed on /data, found at $VD_PATH"
fi

if ! [[ -f "$VD_PATH" ]]; then
    abort "✗ ERROR: Vending APK not found at $VD_PATH"
fi

VD_VER="$(echo "$DUMP_VD" | grep versionCode | head -n1 | cut -d" " -f5 | cut -d= -f2)"
VD_VERN="$(echo "$DUMP_VD" | grep versionName | head -n1 | cut -d" " -f5 | cut -d= -f2)"
ui_print "  ✓ Version: $VD_VERN (code: $VD_VER)"

ui_print " "
ui_print "==================================="
ui_print "  Installing to System Partition"
ui_print "==================================="
ui_print " "

if [ ! -d "/my_bigball/priv-app/GmsCore" ]; then
  ui_print "→ Installing microG GmsCore..."
  ui_print "  Destination: /system/product/priv-app/GmsCore/"
  mkdir -p "$MODPATH/system/product/priv-app/GmsCore" || abort "✗ ERROR: Failed to create directory"
  cp "$GMS_PATH" "$MODPATH/system/product/priv-app/GmsCore/GmsCore.apk" || abort "✗ ERROR: Failed to copy GmsCore.apk"
  ui_print "  ✓ GmsCore.apk installed successfully"
else
  ui_print "→ Installing microG GmsCore..."
  ui_print "  Destination: /system/priv-app/microG/"
  mkdir -p "$MODPATH/system/priv-app/microG" || abort "✗ ERROR: Failed to create directory"
  cp "$GMS_PATH" "$MODPATH/system/priv-app/microG/microG.apk" || abort "✗ ERROR: Failed to copy microG.apk"
  ui_print "  ✓ microG.apk installed successfully"
fi

ui_print " "
if (echo "$DUMP_VD" | grep "android.permission.FAKE_PACKAGE_SIGNATURE") >/dev/null; then
  ui_print "- Installing microG Companion"
  pm grant com.android.vending android.permission.FAKE_PACKAGE_SIGNATURE 2>/dev/null
  ui_print "Installing microG Companion"
else
  ui_print "- Installing Play Store"
fi
if ! [ -d "/my_bigball/priv-app/GmsCore" ]; then
  mkdir -p "$MODPATH/system/product/priv-app/Phonesky"
  cp "$VD_PATH" "$MODPATH/system/product/priv-app/Phonesky/Phonesky.apk"
else
  mkdir -p "$MODPATH/system/priv-app/Phonesky"
  cp "$VD_PATH" "$MODPATH/system/priv-app/Phonesky/Phonesky.apk"
fi

ui_print " "
ui_print "==================================="
ui_print "  Installation Complete!"
ui_print "==================================="
ui_print " "
ui_print "Your apps have been moved to /system"
ui_print "Reboot to apply changes"
ui_print " "

mmm_exec hideLoading
