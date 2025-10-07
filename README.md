# microG Installer Revived.... again

A Magisk/KernelSU module that **converts** microG GmsCore from a user app to a privileged system app.

**Forked from nift4's microG Installer Revived** - Updated to support microG 0.3.9.250932.

> **Note:** This module doesn't bundle or install microG for you - it moves your already-installed microG to system with proper privileges. Think of it as a "converter" rather than an "installer".

## Personal Project Notice

This is maintained for my personal use and currently works with **microG 0.3.9.250932**. 

## What This Module Actually Does

1. **Finds** your installed microG user apps
2. **Copies** them to `/system/priv-app/` (via Magisk overlay)
3. **Grants** necessary system-level permissions
4. **Enables** signature spoofing and other privileged features

Your original user apps remain untouched - the module just makes the system prioritize the privileged copies.

## Current Version Support

- **microG GmsCore:** 0.3.9.250932 - **Currently tested and working**
- **microG Companion:** 0.3.9.40226
- **Older versions:** 0.3.5+ may work but are not actively tested

## Requirements

⚠️ **DO NOT INSTALL** if you have Google Play Services already installed

1. **Signature spoofing support** - Your ROM must support this
   - Check with "Signature Spoofing Checker" app
   - If not supported, try [FakeGApps](https://github.com/whew-inc/FakeGApps/releases)

2. **Install microG FIRST** - This is critical! Install as regular user app before flashing module
   - Download microG 0.3.9.250932 from [microG GitHub](https://github.com/microg/GmsCore/releases/tag/v0.3.9.250932)
   - Install the standard variant (not `-hw` or `-lh`)
   - Install both GmsCore AND Companion/Play Store

## Installation

1. Verify signature spoofing is enabled
2. **Install microG GmsCore 0.3.9.250932 as user app** ← Do this first!
3. **Install Companion (or Play Store) as user app** ← Do this too!
4. Flash this module in Magisk/KernelSU
5. Reboot
6. Grant permissions in microG Settings

## Updating microG

**Within the same version series (0.3.9.x):** Just install the new APK normally - no need to reflash.

Download from:
- [microG GitHub Releases](https://github.com/microg/GmsCore/releases)
- [microG F-Droid Repository](https://microg.org/download.html)

## For Real Play Store Users

Install Play Store APK (from APKMirror, non-bundle only) as user app before flashing the module. The module will detect and convert it automatically.

## Common Issues

- **"Maximum supported version" error** - You're using a newer microG than this module supports. Wait for update or use 0.3.9.250932.
- **Bootloop:** Use [Magisk Safe Mode](https://topjohnwu.github.io/Magisk/faq.html) to disable module
- **Black screen:** Don't use Magisk Delta's SuList
- **App crashes (browsers):** Disable KSU Unmount modules for that app
- **Background location permission:** Go to App Info > Permissions > Location > tap warning > retry
- **Play Store error DF-DFERH-01:** Enable Device Registration in microG settings

## Credits

- **microG Project** - For microG itself
- **nift4** - For microG Installer Revived
- **Hieu Van** - For the original microG Installer
- **Contributors** - Fs00, chris42, FriendlyNeighborhoodShane, and others

## Links

- [Report Issues](https://github.com/spacealtctrl/microg_installer_revived_again/issues)
- [Original Project](https://github.com/nift4/microg_installer_revived)
- [microG Project](https://microg.org)
