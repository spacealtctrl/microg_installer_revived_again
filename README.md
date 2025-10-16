# microG Installer Revived… again

A **Magisk / KernelSU module** that converts your installed microG GmsCore from a user app into a **system-level app** to improve **Play Integrity behavior** and testing on custom or rooted devices.  

**Forked from nift4's microG Installer Revived** — updated to support **microG 0.3.10.250932**.

> **Note:** This module does not bundle or install microG. It promotes your already-installed microG to the system layer with proper privileges. Think of it as a **converter**, not a traditional installer.

---

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" width="60" alt="Telegram Logo" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://microg.org/images/logo.png" width="60" alt="microG Logo" />
</p>

<h2 align="center">Personal Project Notice</h2>

<p align="center">
  <i>This is a personal side project maintained for testing and research.</i><br>
  <b>Current support focuses on:</b> microG <code>v0.3.10.250932</code>
</p>

---

<p align="center">
  <a href="https://t.me/microGRevivedAgain">
    <img src="https://img.shields.io/badge/Join%20Telegram%20Testing%20Group-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" alt="Join Telegram" />
  </a>
</p>

---

<p align="center">
  <i>Your feedback, logs, and results help improve this project — every tester matters.</i>
</p>

---

## Overview

This module allows your **user-installed microG apps** to operate at the system level by promoting them into `/system/priv-app/` using Magisk/KernelSU overlay mechanisms. By doing so, microG:

- Gains system-level privileges required for testing Play Integrity  
- Is treated by Android as a system component without modifying `/system` permanently  
- Allows apps to interact with microG in a closer-to-native environment  
- Leaves your original user-installed apps untouched; the system prioritizes the overlayed copies  

This approach provides a safe, reversible way to **evaluate Play Integrity responses** and improve compatibility in rooted or custom ROM environments.

---

## Features

- Detects installed microG GmsCore and Companion apps  
- Converts them into **system-level apps** using overlay mechanisms  
- Grants necessary **system permissions** and enables features like **signature spoofing**  
- Reversible: removing the module restores the system to its original state  
- Tested with latest microG releases while remaining compatible with prior 0.3.5+ versions (untested)

---

## Supported Versions

| Component           | Version Tested     |
|--------------------|--------------------|
| microG GmsCore      | 0.3.10.250932      |
| microG Companion    | 0.3.10.40226       |
| Older microG        | 0.3.5+ (untested)  |

---

## Requirements

**Do NOT install** if Google Play Services are present.  

1. **Signature spoofing support** – check using the Signature Spoofing Checker
   - If unsupported, see [FakeGApps](https://github.com/whew-inc/FakeGApps/releases)  

2. **Pre-installed microG apps** – both GmsCore and Companion must be installed as **user apps** before flashing the module  

---

## Installation

1. Verify signature spoofing is enabled  
2. Install **microG GmsCore 0.3.10.250932** as a user app  
3. Install **microG Companion / Play Store variant** as a user app  
4. Flash this module via Magisk or KernelSU  
5. Reboot  
6. Grant necessary permissions in microG Settings  

> The module automatically detects and converts your user-installed apps to system-level versions during boot.

---

## Updating microG

For updates **within the 0.3.10.x series**, simply install the new APK — no need to reflash the module.  

Sources:  
- [microG GitHub Releases](https://github.com/microg/GmsCore/releases)  
- [microG F-Droid Repository](https://microg.org/download.html)

---

## Notes for Play Store Users

- Install the Play Store APK (standard APK, not bundle) **before flashing**  
- Module should detect and convert it automatically  
- Contact the maintainer if detection fails

---

## Testing & Feedback

This module is intended for **testing and improving Play Integrity results**. Testers are encouraged to report:

- System-level behavior of apps interacting with microG  
- Boot and overlay behavior on different ROMs and kernels  
- Any permission, integration, or compatibility anomalies  

**Recommendation:** use secondary devices or emulators and back up important data before testing.


---

## Credits

- **microG Project** – microG GmsCore and Companion  
- **nift4** – original microG Installer Revived  
- **Hieu Van** – original microG Installer  
- **Contributors** – Fs00, chris42, FriendlyNeighborhoodShane, and others  

---

## Links

- [Report Issues](https://github.com/spacealtctrl/microg_installer_revived_again/issues)  
- [Original Project](https://github.com/nift4/microg_installer_revived)  
- [microG Project](https://microg.org)  
- **Telegram Testing Group:** [https://t.me/microGRevivedAgain](https://t.me/microGRevivedAgain)
