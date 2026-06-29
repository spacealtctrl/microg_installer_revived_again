#!/system/bin/sh

MODDIR=${0%/*}

echo "microG Installer Revived.... again $(grep '^version=' "$MODDIR/module.prop" | cut -d= -f2)"
echo ""

if [ -f "$MODDIR/system/product/priv-app/GmsCore/GmsCore.apk" ] || [ -f "$MODDIR/system/priv-app/microG/microG.apk" ]; then
  echo "GmsCore: promoted to system priv-app"
else
  echo "GmsCore: not promoted"
fi

if [ -f "$MODDIR/system/product/priv-app/Phonesky/Phonesky.apk" ] || [ -f "$MODDIR/system/priv-app/Phonesky/Phonesky.apk" ]; then
  echo "Companion / Play Store: promoted to system priv-app"
else
  echo "Companion / Play Store: not promoted"
fi

echo ""
echo "Open the WebUI to manage microG."
