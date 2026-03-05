
import { exec as ksuExec, toast as ksuToast } from 'kernelsu'

const LOG_PATH = '/data/adb/modules/microg_installer_revived_again/debug.log'

let isLoggingEnabled = false

export function setLoggingEnabled(val) {
  isLoggingEnabled = val
}

export async function debugLog(tag, msg) {
  if (!isLoggingEnabled) return
  try {
    const ts = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '')
    const line = `[${ts}] [${tag}] ${msg}`
    const escaped = line.replace(/\\/g, '\\\\').replace(/'/g, "'\\''")
    await ksuExec(`printf '%s\\n' '${escaped}' >> '${LOG_PATH}'`)
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
  return exec(`cat '${path}'`)
}

export async function readFileSafe(path) {
  await debugLog('KernelSU.js', `readFileSafe: ${path}`)
  const { errno, stdout } = await ksuExec(`cat '${path}' 2>/dev/null`)
  if (errno !== 0) {
    await debugLog('KernelSU.js', `✓ readFileSafe: ${path} not found, returned empty`)
    return ''
  }
  const trimmed = stdout.trim()
  await debugLog('KernelSU.js', `✓ readFileSafe OK: ${trimmed.slice(0, 200)}`)
  return trimmed
}

export async function writeFile(path, content) {
  await debugLog('KernelSU.js', `writeFile: ${path} (${content.length} chars)`)
  const escaped = content.replace(/'/g, "'\\''")
  return exec(`echo '${escaped}' > '${path}'`)
}

export async function fileExists(path) {
  await debugLog('KernelSU.js', `fileExists: ${path}`)
  const { errno } = await ksuExec(`[ -f '${path}' ]`)
  const exists = errno === 0
  await debugLog('KernelSU.js', `✓ fileExists: ${path} → ${exists}`)
  return exists
}

export async function readLog() {
  try {
    const { stdout } = await ksuExec(`cat '${LOG_PATH}' 2>/dev/null || echo ''`)
    return stdout
  } catch {
    return ''
  }
}

export async function clearLog() {
  try {
    const ts = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '')
    await ksuExec(`echo '[${ts}] [KernelSU.js] === LOG CLEARED ===' > '${LOG_PATH}'`)
  } catch {
  }
}

export function openWebsite(url) {
  if (isKSUWebUI()) {
    exec(`am start -a android.intent.action.VIEW -d '${url}'`)
  } else {
    window.open(url, '_blank')
  }
}

export function toast(msg) {
  ksuToast(msg)
}
