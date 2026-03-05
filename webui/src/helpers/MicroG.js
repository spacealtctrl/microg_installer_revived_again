
import { exec, execSafe, debugLog } from './KernelSU.js'

const TAG = 'MicroG.js'

const GITHUB_API = 'https://api.github.com/repos/microg/GmsCore/releases'
export async function fetchReleases() {
  await debugLog(TAG, 'fetchReleases: calling GitHub API')
  const response = await fetch(`${GITHUB_API}?per_page=20`)
  if (!response.ok) {
    await debugLog(TAG, `✗ fetchReleases: GitHub API error ${response.status}`)
    throw new Error(`GitHub API error: ${response.status}`)
  }
  const data = await response.json()
  await debugLog(TAG, `✓ fetchReleases: got ${data.length} releases`)
  return data
}

export async function detectDevice() {
  await debugLog(TAG, 'detectDevice: checking manufacturer')
  const manufacturer = await execSafe('getprop ro.build.manufacturer')
  const lower = manufacturer.toLowerCase()
  const result = (lower === 'huawei' || lower === 'honor') ? 'huawei' : 'standard'
  await debugLog(TAG, `✓ detectDevice: manufacturer=${manufacturer} → ${result}`)
  return result
}

export function filterAssetsForDevice(assets, deviceType) {
  return assets.filter((asset) => {
    const name = asset.name.toLowerCase()
    if (name.endsWith('.asc')) return false
    if (name.includes('org.microg.gms') && name.includes('-user.apk')) return false
    if (deviceType === 'huawei') {
      return name.endsWith('-hw.apk')
    }
    return !name.endsWith('-hw.apk')
  })
}

export async function getInstalledMicroG() {
  await debugLog(TAG, 'getInstalledMicroG: checking com.google.android.gms')
  const version = await execSafe(
    "dumpsys package com.google.android.gms | grep -m1 versionName | sed 's/.*versionName=//'"
  )
  const codeStr = await execSafe(
    "dumpsys package com.google.android.gms | grep -m1 versionCode= | sed 's/.*versionCode=//' | awk '{print $1}'"
  )
  if (!version) {
    await debugLog(TAG, '✓ getInstalledMicroG: not installed')
    return { installed: false, versionName: '', versionCode: '', isMicroG: false }
  }
  const fakeCheck = await execSafe(
    "dumpsys package com.google.android.gms | grep -c FAKE_PACKAGE_SIGNATURE"
  )
  const isMicroG = parseInt(fakeCheck) > 0
  await debugLog(TAG, `✓ getInstalledMicroG: version=${version} code=${codeStr} isMicroG=${isMicroG}`)
  return { installed: true, versionName: version, versionCode: codeStr, isMicroG }
}

export async function getInstalledCompanion() {
  await debugLog(TAG, 'getInstalledCompanion: checking com.android.vending')
  const version = await execSafe(
    "dumpsys package com.android.vending | grep -m1 versionName | sed 's/.*versionName=//'"
  )
  const codeStr = await execSafe(
    "dumpsys package com.android.vending | grep -m1 versionCode= | sed 's/.*versionCode=//' | awk '{print $1}'"
  )
  if (!version) {
    await debugLog(TAG, '✓ getInstalledCompanion: not installed')
    return { installed: false, versionName: '', versionCode: '', isCompanion: false }
  }
  const fakeCheck = await execSafe(
    "dumpsys package com.android.vending | grep -c FAKE_PACKAGE_SIGNATURE"
  )
  const isCompanion = parseInt(fakeCheck) > 0
  await debugLog(TAG, `✓ getInstalledCompanion: version=${version} code=${codeStr} isCompanion=${isCompanion}`)
  return { installed: true, versionName: version, versionCode: codeStr, isCompanion }
}

export async function isGmsInPrivApp() {
  await debugLog(TAG, 'isGmsInPrivApp: checking overlay dirs')
  const result = await execSafe(
    "[ -f /data/adb/modules/microg_installer_revived_again/system/product/priv-app/GmsCore/GmsCore.apk ] && echo 1 || ([ -f /data/adb/modules/microg_installer_revived_again/system/priv-app/microG/microG.apk ] && echo 1 || echo 0)"
  )
  await debugLog(TAG, `✓ isGmsInPrivApp: ${result === '1'}`)
  return result === '1'
}

export async function isCompanionInPrivApp() {
  await debugLog(TAG, 'isCompanionInPrivApp: checking overlay dirs')
  const result = await execSafe(
    "[ -f /data/adb/modules/microg_installer_revived_again/system/product/priv-app/Phonesky/Phonesky.apk ] && echo 1 || ([ -f /data/adb/modules/microg_installer_revived_again/system/priv-app/Phonesky/Phonesky.apk ] && echo 1 || echo 0)"
  )
  await debugLog(TAG, `✓ isCompanionInPrivApp: ${result === '1'}`)
  return result === '1'
}

export async function getMetamodule() {
  await debugLog(TAG, 'getMetamodule: checking /data/adb/metamodule/module.prop')
  const name = await execSafe(
    "head -n1 /data/adb/metamodule/module.prop | cut -d= -f2"
  )
  await debugLog(TAG, `✓ getMetamodule: ${name || '(none)'}`)
  return name || ''
}

export async function downloadApk(url, destPath) {
  await debugLog(TAG, `downloadApk: ${url} → ${destPath}`)
  await exec(`curl -fSL -o '${destPath}' '${url}'`)
  await debugLog(TAG, `✓ downloadApk: download complete`)
  return destPath
}

export async function installApk(apkPath) {
  await debugLog(TAG, `installApk: pm install -r -d ${apkPath}`)
  const result = await exec(`pm install -r -d '${apkPath}'`)
  await debugLog(TAG, `✓ installApk: result=${result}`)
  return result
}

export async function uninstallPackage(packageName) {
  await debugLog(TAG, `uninstallPackage: ${packageName}`)
  const result = await exec(`pm uninstall '${packageName}'`)
  await debugLog(TAG, `✓ uninstallPackage: result=${result}`)
  return result
}

export function getPackageName(assetName) {
  const match = assetName.match(/^([\w.]+)-\d+/)
  return match ? match[1] : ''
}

export async function isModuleActive() {
  await debugLog(TAG, 'isModuleActive: checking disable file')
  const disabled = await execSafe('[ -f /data/adb/modules/microg_installer_revived_again/disable ] && echo 1 || echo 0')
  const active = disabled !== '1'
  await debugLog(TAG, `✓ isModuleActive: ${active}`)
  return active
}

export async function promoteApks() {
  await debugLog(TAG, 'promoteApks: calling promote.sh')
  const result = await execSafe('sh /data/adb/modules/microg_installer_revived_again/promote.sh')
  await debugLog(TAG, `✓ promoteApks: result=${result}`)
  return parseInt(result) || 0
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export async function demoteApks() {
  await debugLog(TAG, 'demoteApks: calling demote.sh')
  await execSafe('sh /data/adb/modules/microg_installer_revived_again/demote.sh')
  await debugLog(TAG, '✓ demoteApks: done')
}
