# microG Installer Revived Again

A Magisk/KernelSU module that installs microG GmsCore, GsfProxy, and Companion (or Play Store) to `/system/priv-app`.

**Forked from nift4's microG Installer Revived** - Updated to support modern microG versions (0.3.5+).

## Personal Project Notice

This is primarily maintained for my personal use. I'll update it when I can, but support may be limited. Feel free to use it, fork it, or submit PRs.

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

2. **Install microG first** - Install as regular user app before flashing module
   - Download from [microG GitHub](https://github.com/microg/GmsCore/releases)
   - Install the standard variant (not `-hw` or `-lh`)

## Installation

1. Verify signature spoofing is enabled
2. Install microG GmsCore as user app
3. Install Companion (or Play Store) as user app
4. Flash this module in Magisk/KernelSU
5. Reboot
6. Grant permissions in microG Settings

## Updating microG

Just install the new APK normally - **no need to reflash the module**.

Download from:
- [microG GitHub Releases](https://github.com/microg/GmsCore/releases)
- [microG F-Droid Repository](https://microg.org/download.html)

## For Real Play Store Users

Install Play Store APK (from APKMirror, non-bundle only) as user app before flashing the module. The module will detect and convert it automatically.

## Common Issues

- **Bootloop:** Use [Magisk Safe Mode](https://topjohnwu.github.io/Magisk/faq.html) to disable module
- **Black screen:** Don't use Magisk Delta's SuList
- **App crashes (browsers):** Disable KSU Unmount modules for that app
- **Background location permission:** Go to App Info > Permissions > Location > tap warning > retry
- **Play Store error DF-DFERH-01:** Enable Device Registration in microG settings

## Building
bash
wget -O META-INF/com/google/android/update-binary https://raw.githubusercontent.com/topjohnwu/Magisk/master/scripts/module_installer.sh
zip microG_Installer_Revived_Again.zip -9r * -x update.json

Credits

- microG Project - For microG itself
- nift4 - For microG Installer Revived
- Hieu Van - For the original microG Installer
- Contributors - Fs00, chris42, FriendlyNeighborhoodShane, and others
