# microG Installer Revived Again

A Magisk/KernelSU module that **converts** microG GmsCore from a user app to a privileged system app.

**Forked from nift4's microG Installer Revived** - Updated to support modern microG versions (0.3.5+).

> **Note:** This module doesn't bundle or install microG for you - it moves your already-installed microG to system with proper privileges. Think of it as a "converter" rather than an "installer".

## Personal Project Notice

This is primarily maintained for my personal use. I'll update it when I can, but support may be limited. Feel free to use it, fork it, or submit PRs.

## What This Module Actually Does

1. **Finds** your installed microG user apps
2. **Copies** them to `/system/priv-app/` (via Magisk overlay)
3. **Grants** necessary system-level permissions
4. **Enables** signature spoofing and other privileged features

Your original user apps remain untouched - the module just makes the system prioritize the privileged copies.

## What's Different in This Fork

- **Supports microG 0.3.5 through 0.3.9+** (including the new versioning scheme like 0.3.9.250932)
- Version checks updated to allow modern microG versions
- Tested with latest microG releases

## Supported Versions

- **microG GmsCore:** 0.3.5 - 0.3.9+ (version code 250932018)
- **microG Companion:** Matching versions
- **GsfProxy:** 0.1.0 (bundled)
- **MapsV1:** 0.1.0 (bundled)

## Requirements

⚠️ **DO NOT INSTALL** if you have Google Play Services already installed

1. **Signature spoofing support** - Your ROM must support this
   - Check with "Signature Spoofing Checker" app
   - If not supported, try [FakeGApps](https://github.com/whew-inc/FakeGApps/releases)

2. **Install microG FIRST** - This is critical! Install as regular user app before flashing module
   - Download from [microG GitHub](https://github.com/microg/GmsCore/releases)
   - Install the standard variant (not `-hw` or `-lh`)
   - Install both GmsCore AND Companion/Play Store

## Installation

1. Verify signature spoofing is enabled
2. **Install microG GmsCore as user app** ← Do this first!
3. **Install Companion (or Play Store) as user app** ← Do this too!
4. Flash this module in Magisk/KernelSU
5. Reboot
6. Grant permissions in microG Settings

## Why So Small? (3.8 KB)

Unlike older modules that bundled 45+ MB of APK files, this module is tiny because it just **converts** your already-installed apps. This means:

✅ Always use the latest microG version  
✅ Update microG anytime without reflashing  
✅ Smaller download size  
✅ More flexible  

## Updating microG

Just install the new APK normally - **no need to reflash the module**.

Download from:
- [microG GitHub Releases](https://github.com/microg/GmsCore/releases)
- [microG F-Droid Repository](https://microg.org/download.html)

The module will automatically use whatever version you have installed!

## For Real Play Store Users

Install Play Store APK (from APKMirror, non-bundle only) as user app before flashing the module. The module will detect and convert it automatically.

## Common Issues

- **"You do not have official microG installed"** - Install microG as user app first!
- **Bootloop:** Use [Magisk Safe Mode](https://topjohnwu.github.io/Magisk/faq.html) to disable module
- **Black screen:** Don't use Magisk Delta's SuList
- **App crashes (browsers):** Disable KSU Unmount modules for that app
- **Background location permission:** Go to App Info > Permissions > Location > tap warning > retry
- **Play Store error DF-DFERH-01:** Enable Device Registration in microG settings

## Building

```bash
wget -O META-INF/com/google/android/update-binary https://raw.githubusercontent.com/topjohnwu/Magisk/master/scripts/module_installer.sh
zip microG_Installer_Revived_Again.zip -9r * -x update.json
```

Or on Windows with 7-Zip, add all files except `.git` folder and `update.json`.

## Credits

- **microG Project** - For microG itself
- **nift4** - For microG Installer Revived
- **Hieu Van** - For the original microG Installer
- **Contributors** - Fs00, chris42, FriendlyNeighborhoodShane, and others

## Links

- [Report Issues](https://github.com/spacealtctrl/microg_installer_revived_again/issues)
- [Original Project](https://github.com/nift4/microg_installer_revived)
- [microG Project](https://microg.org)
