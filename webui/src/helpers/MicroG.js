
import { exec, execSafe, debugLog, shq } from './KernelSU.js'

const TAG = 'MicroG.js'

const GITHUB_API = 'https://api.github.com/repos/microg/GmsCore/releases'

export async function fetchReleases() {
  await debugLog(TAG, 'fetchReleases: calling GitHub API')
  const response = await fetch(`${GITHUB_API}?per_page=20`)
  if (!response.ok) {
    if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
      const reset = parseInt(response.headers.get('x-ratelimit-reset'))
      const mins = reset ? Math.max(1, Math.ceil((reset * 1000 - Date.now()) / 60000)) : 0
      await debugLog(TAG, '✗ fetchReleases: GitHub rate limit reached')
      throw new Error(mins ? `GitHub rate limit reached. Try again in ~${mins} min.` : 'GitHub rate limit reached. Try again later.')
    }
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

export async function pickDownloader() {
  return execSafe(
    'command -v curl >/dev/null 2>&1 && echo curl || (command -v wget >/dev/null 2>&1 && echo wget || (command -v busybox >/dev/null 2>&1 && echo busybox || echo none))'
  )
}

export async function downloadApk(url, destPath, totalSize, onProgress) {
  await debugLog(TAG, `downloadApk: ${url} → ${destPath}`)
  const tool = await pickDownloader()
  if (tool === 'none') {
    throw new Error('No downloader available (curl or wget required)')
  }
  let cmd
  if (tool === 'curl') cmd = `curl -fsSL -o ${shq(destPath)} ${shq(url)}`
  else if (tool === 'wget') cmd = `wget -q -O ${shq(destPath)} ${shq(url)}`
  else cmd = `busybox wget -q -O ${shq(destPath)} ${shq(url)}`

  let poll
  if (totalSize > 0 && typeof onProgress === 'function') {
    poll = setInterval(async () => {
      const got = parseInt(await execSafe(`stat -c %s ${shq(destPath)} 2>/dev/null || echo 0`)) || 0
      onProgress(Math.min(99, Math.round((got / totalSize) * 100)))
    }, 500)
  }
  try {
    await exec(`rm -f ${shq(destPath)}; ${cmd}`)
  } finally {
    if (poll) clearInterval(poll)
  }
  const size = parseInt(await execSafe(`stat -c %s ${shq(destPath)} 2>/dev/null || echo 0`)) || 0
  if (size === 0) {
    throw new Error('Download failed')
  }
  if (typeof onProgress === 'function') onProgress(100)
  await debugLog(TAG, `✓ downloadApk: complete (${size} bytes via ${tool})`)
  return destPath
}

export async function verifyApkDigest(path, digest) {
  if (!digest || !digest.startsWith('sha256:')) {
    await debugLog(TAG, 'verifyApkDigest: no sha256 digest provided, skipping')
    return { ok: true, skipped: true }
  }
  const expected = digest.slice(7).toLowerCase()
  const actual = (await execSafe(`sha256sum ${shq(path)} 2>/dev/null | awk '{print $1}'`)).toLowerCase()
  if (!actual) {
    return { ok: false, reason: 'sha256sum unavailable' }
  }
  const ok = actual === expected
  await debugLog(TAG, `✓ verifyApkDigest: ${ok ? 'match' : 'MISMATCH'}`)
  return { ok, expected, actual }
}

export async function installApk(apkPath) {
  await debugLog(TAG, `installApk: pm install -r -d ${apkPath}`)
  const result = await exec(`pm install -r -d ${shq(apkPath)}`)
  await debugLog(TAG, `✓ installApk: result=${result}`)
  return result
}

export async function removeFile(path) {
  await execSafe(`rm -f ${shq(path)}`)
}

export async function uninstallPackage(packageName) {
  await debugLog(TAG, `uninstallPackage: ${packageName}`)
  const result = await exec(`pm uninstall ${shq(packageName)}`)
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
