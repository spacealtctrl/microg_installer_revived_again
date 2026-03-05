[![Telegram](https://img.shields.io/badge/Telegram-microGRevivedAgain-blue?logo=telegram)](https://t.me/microGRevivedAgain)
[![Website](https://img.shields.io/badge/Website-spacealtctrl.net-blue?logo=firefoxbrowser&logoColor=white)](https://spacealtctrl.net)

# microG Installer Revived… again

---

A Magisk / KernelSU module that converts your installed microG GmsCore from a user app into a system-level app to improve Play Integrity behavior and testing on custom or rooted devices.

This module improves how microG interacts with the Android system by converting the `GmsCore` and `Companion` apps into privileged system-level apps (`priv-app`).

> If this module helps you, please consider sharing your Play Integrity results in the [Telegram Results Group](https://t.me/microGRevivedAgainResults).

---

### Features

- **System-Level Promotion**: Promotes your installed microG and Companion apps to `/system/product/priv-app/` or `/system/priv-app/` for system-level permissions.
- **In-App WebUI**: Manage everything from a clean interface embedded directly inside KernelSU. For Magisk users, the [WebUI X](https://github.com/DerEffe/webui-x) module is recommended to view this interface.
- **Promote / Demote**: Easily toggle the module active state and manage your microG system apps.
- **Built-in microG Updater**: Features an "Installer" that fetches the latest official releases from the microG GitHub repository, allowing you to quickly download and update your APKs.
- **Multi-Language Support**: The WebUI is localized for community-driven translations.

---

### Requirements
1. **Signature Spoofing**: Your ROM must support signature spoofing natively, or you must install a spoofing module like [FakeGApps](https://github.com/whew-inc/FakeGApps/releases) via LSPosed.
2. **Pre-installed microG**: If you are a Magisk user and are **not** using the WebUI X interface, you *must* explicitly install both the `GmsCore` and `Companion`/`Play Store` APKs manually on your device before flashing the module. `customize.sh` takes care of automatically detecting and promoting both apps during installation.

---

### Installation

1. Install the microG `GmsCore` and `Companion`/`Play Store` APKs manually on your device.
2. Flash the `microg_installer_revived_again` ZIP file via Magisk or KernelSU.
3. Reboot your device.
4. **KernelSU Users**: Open the KernelSU app, navigate to the Modules tab, and tap the module to open the WebUI. From here you can check status, manage updates, and access logs (if enabled).
5. **Magisk Users**: I suggest using [WebUI X](https://github.com/DerEffe/webui-x) to interact with the module's interface. Otherwise, rely on `customize.sh` which will automatically promote the APKs you installed prior to flashing.

---

### Support & Contributions

If you have/find a bug, please turn on "Debug logging" in the WebUI Settings, reproduce the issue, check the **Logs** tab, and copy the output into a new [GitHub Issue](https://github.com/spacealtctrl/microg_installer_revived_again/issues).

If you'd like to help translate the WebUI into your language, please fork the repository and see the `webui/src/locales/` directory!

---

### Credits
- **[microG Project](https://microg.org)** for the core GmsCore implementation.
- **[nift4](https://github.com/nift4/microg_installer_revived)** for the original module.
- **Hieu Van** 
- **All Telegram community members for testing and feedback.
