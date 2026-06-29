
import { exec as ksuExec, toast as ksuToast } from 'kernelsu'

const LOG_PATH = '/data/adb/modules/microg_installer_revived_again/debug.log'

let isLoggingEnabled = false

export function setLoggingEnabled(val) {
  isLoggingEnabled = val
}

export function shq(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`
}

export async function debugLog(tag, msg) {
  if (!isLoggingEnabled) return
  try {
    const ts = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '')
    const line = `[${ts}] [${tag}] ${msg}`
    await ksuExec(`printf '%s\\n' ${shq(line)} >> ${shq(LOG_PATH)}`)
  } catch {
  }
}

export function isKSUWebUI() {
  return typeof ksu !== 'undefined'
}

export async function exec(cmd) {
  await debugLog('KernelSU.js', `exec: ${cmd}`)
  const { errno, stdout, stderr } = await ksuExec(cmd)
  if (errno !== 0) {
    await debugLog('KernelSU.js', `✗ exec FAILED (errno=${errno}): ${stderr}`)
    throw new Error(stderr || `Command failed with code ${errno}`)
  }
  const trimmed = stdout.trim()
  await debugLog('KernelSU.js', `✓ exec OK: ${trimmed.slice(0, 200)}`)
  return trimmed
}

export async function execSafe(cmd) {
  await debugLog('KernelSU.js', `execSafe: ${cmd}`)
  const { errno, stdout } = await ksuExec(cmd)
  const trimmed = stdout.trim()
  if (errno !== 0) {
    await debugLog('KernelSU.js', `✓ execSafe: returned empty (errno=${errno})`)
    return ''
  }
  await debugLog('KernelSU.js', `✓ execSafe OK: ${trimmed.slice(0, 200)}`)
  return trimmed
}

export async function readFile(path) {
  await debugLog('KernelSU.js', `readFile: ${path}`)
  return exec(`cat ${shq(path)}`)
}

export async function readFileSafe(path) {
  await debugLog('KernelSU.js', `readFileSafe: ${path}`)
  const { errno, stdout } = await ksuExec(`cat ${shq(path)} 2>/dev/null`)
  if (errno !== 0) {
    await debugLog('KernelSU.js', `✓ readFileSafe: ${path} not found, returned empty`)
    return ''
  }
  return stdout.trim()
}

export async function writeFile(path, content) {
  await debugLog('KernelSU.js', `writeFile: ${path} (${content.length} chars)`)
  return exec(`printf '%s' ${shq(content)} > ${shq(path)}`)
}

export async function fileExists(path) {
  await debugLog('KernelSU.js', `fileExists: ${path}`)
  const { errno } = await ksuExec(`[ -f ${shq(path)} ]`)
  return errno === 0
}

export async function readLog() {
  try {
    const { stdout } = await ksuExec(`cat ${shq(LOG_PATH)} 2>/dev/null || echo ''`)
    return stdout
  } catch {
    return ''
  }
}

export async function clearLog() {
  try {
    const ts = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '')
    await ksuExec(`printf '%s\\n' ${shq(`[${ts}] [KernelSU.js] === LOG CLEARED ===`)} > ${shq(LOG_PATH)}`)
  } catch {
  }
}

export function openWebsite(url) {
  if (isKSUWebUI()) {
    exec(`am start -a android.intent.action.VIEW -d ${shq(url)}`)
  } else {
    window.open(url, '_blank')
  }
}

export function toast(msg) {
  ksuToast(msg)
}
