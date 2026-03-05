
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { writeFile, readFileSafe, setLoggingEnabled, execSafe } from '@/helpers/KernelSU.js'
import { i18n } from '@/i18n.js'

const SETTINGS_FILE = '/data/adb/modules/microg_installer_revived_again/settings.json'
const THEME_FILE = '/data/adb/modules/microg_installer_revived_again/theme.conf'
const LOG_FLAG = '/data/adb/modules/microg_installer_revived_again/debug_logging_enabled'
const THEMES = ['space', 'light', 'dark']

export const useThemeStore = defineStore('theme', () => {
  const theme = ref('space')
  const language = ref('en')
  const bottomPadding = ref(40)
  const uiScale = ref(100)
  const debugLogging = ref(false)

  const LANGUAGES = [
    { code: 'en', label: 'English' }
  ]

  let saveTimeout = null

  function applyTheme(name) {
    document.documentElement.setAttribute('data-theme', name)
  }

  function applyUiSettings() {
    document.documentElement.style.setProperty('--bottom-padding', bottomPadding.value + 'px')
    const content = document.getElementById('content-wrapper')
    if (content) content.style.zoom = (uiScale.value / 100).toString()
    
    i18n.global.locale.value = language.value

    setLoggingEnabled(debugLogging.value)
    if (debugLogging.value) {
      execSafe(`touch '${LOG_FLAG}'`)
    } else {
      execSafe(`rm -f '${LOG_FLAG}' '/data/adb/modules/microg_installer_revived_again/debug.log'`)
    }
  }

  function debouncedSave() {
    clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => saveSettings(), 400)
  }

  async function saveSettings() {
    try {
      await writeFile(SETTINGS_FILE, JSON.stringify({
        theme: theme.value,
        language: language.value,
        bottomPadding: bottomPadding.value,
        uiScale: uiScale.value,
        debugLogging: debugLogging.value
      }))
    } catch {}
  }

  async function loadSettings() {
    const raw = await readFileSafe(SETTINGS_FILE)
    if (raw) {
      try {
        const settings = JSON.parse(raw)
        if (THEMES.includes(settings.theme)) theme.value = settings.theme
        if (settings.language) language.value = settings.language
        if (typeof settings.bottomPadding === 'number') bottomPadding.value = settings.bottomPadding
        if (typeof settings.uiScale === 'number') uiScale.value = settings.uiScale
        if (typeof settings.debugLogging === 'boolean') debugLogging.value = settings.debugLogging
      } catch {}
    } else {
      const saved = await readFileSafe(THEME_FILE)
      if (saved && THEMES.includes(saved)) theme.value = saved
    }
    applyTheme(theme.value)
    applyUiSettings()
  }

  async function setTheme(name) {
    if (!THEMES.includes(name)) return
    theme.value = name
    applyTheme(name)
    await saveSettings()
  }

  async function setLanguage(code) {
    language.value = code
    applyUiSettings()
    await saveSettings()
  }

  function setBottomPadding(value) {
    bottomPadding.value = value
    applyUiSettings()
    debouncedSave()
  }

  function setUiScale(value) {
    uiScale.value = value
    applyUiSettings()
    debouncedSave()
  }

  function setDebugLogging(value) {
    debugLogging.value = value
    applyUiSettings()
    debouncedSave()
  }

  return { theme, language, bottomPadding, uiScale, debugLogging, loadSettings, setTheme, setLanguage, setBottomPadding, setUiScale, setDebugLogging, THEMES, LANGUAGES }
})
