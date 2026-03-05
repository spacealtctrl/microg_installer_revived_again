<template>
  <div class="space-y-4">
    <h1 class="px-1 text-xl font-bold text-on-surface">{{ $t('home.title') }}</h1>

    <PullToRefresh @refresh="onRefresh">
      <div class="space-y-4">
        <button
          class="flex w-full items-center gap-4 rounded-2xl px-5 py-6 text-left active:opacity-80"
          :class="status.loading ? 'bg-surface-container' : isActive ? 'status-active' : 'status-inactive'"
          :disabled="status.loading"
          @click="toggleModule"
        >
          <div v-if="status.loading" class="status-dot status-dot-loading"></div>
          <div v-else class="status-dot" :class="isActive ? 'status-dot-active' : 'status-dot-inactive'"></div>
          <div class="flex-1">
            <p class="text-lg font-semibold text-on-surface">
              <template v-if="status.loading">{{ $t('home.checking') }}</template>
              <template v-else-if="isActive">{{ $t('home.active') }}</template>
              <template v-else-if="!status.moduleActive">{{ $t('home.disabled') }}</template>
              <template v-else>{{ $t('home.not_active') }}</template>
            </p>
            <p class="mt-1 text-xs text-on-surface-variant">
              <template v-if="status.loading">{{ $t('home.detecting') }}</template>
              <template v-else-if="isActive">{{ $t('home.tap_disable') }}</template>
              <template v-else-if="!status.moduleActive">{{ $t('home.tap_enable') }}</template>
              <template v-else>{{ $t('home.needs_promote') }}</template>
            </p>
          </div>
        </button>

        <StatusCard />

        <div class="grid grid-cols-2 gap-2">
          <button
            class="flex w-full items-center justify-center rounded-2xl bg-surface-container px-2 py-3.5 text-sm font-medium text-on-surface active:opacity-80"
            @click="settingsOpen = true"
          >
            {{ $t('home.settings_btn') }}
          </button>
          <button
            class="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-surface-container px-2 py-3.5 text-sm font-medium text-on-surface active:opacity-80"
            @click="openMicroGSettings"
          >
            {{ $t('home.microg_settings_btn') }}
            <svg class="h-4 w-4 shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </button>
        </div>
      </div>
    </PullToRefresh>
  </div>

  <Teleport to="body">
    <div v-if="settingsOpen" class="settings-overlay" @click.self="settingsOpen = false">
      <div class="settings-dialog">
        <h2 class="text-base font-semibold text-on-surface">{{ $t('home.settings_title') }}</h2>

        <div class="mt-4">
          <label class="settings-label">{{ $t('home.language') }}</label>
          <select
            class="settings-select"
            :value="themeStore.language"
            @change="themeStore.setLanguage(($event.target).value)"
          >
            <option v-for="lang in themeStore.LANGUAGES" :key="lang.code" :value="lang.code">
              {{ lang.label }}
            </option>
          </select>
        </div>

        <div class="mt-4">
          <label class="settings-label">{{ $t('home.theme') }}</label>
          <select
            class="settings-select"
            :value="themeStore.theme"
            @change="themeStore.setTheme(($event.target).value)"
          >
            <option value="space">{{ $t('home.theme_space') }}</option>
            <option value="light">{{ $t('home.theme_light') }}</option>
            <option value="dark">{{ $t('home.theme_dark') }}</option>
          </select>
        </div>

        <div class="mt-4">
          <label class="settings-label">
            {{ $t('home.padding') }}
            <span class="float-right">{{ themeStore.bottomPadding }}px</span>
          </label>
          <input
            type="range"
            class="settings-slider"
            min="10"
            max="60"
            step="2"
            :value="themeStore.bottomPadding"
            @input="themeStore.setBottomPadding(Number($event.target.value))"
          />
        </div>

        <div class="mt-4">
          <label class="settings-label">
            {{ $t('home.scale') }}
            <span class="float-right">{{ themeStore.uiScale }}%</span>
          </label>
          <input
            type="range"
            class="settings-slider"
            min="80"
            max="120"
            step="5"
            :value="themeStore.uiScale"
            @input="themeStore.setUiScale(Number($event.target.value))"
          />
        </div>

        <div class="mt-4 flex items-center justify-between">
          <label class="settings-label !mb-0">{{ $t('home.debug_logging') }}</label>
          <div class="toggle-switch" :class="{ 'toggle-active': themeStore.debugLogging }" @click="themeStore.setDebugLogging(!themeStore.debugLogging)">
            <div class="toggle-knob"></div>
          </div>
        </div>

        <button
          class="mt-5 w-full rounded-xl px-4 py-2.5 text-center text-sm font-medium text-on-surface-variant active:opacity-80"
          style="background: var(--input-bg)"
          @click="settingsOpen = false"
        >
          {{ $t('home.close') }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>

import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStatusStore } from '@/stores/Status.js'
import { useThemeStore } from '@/stores/Theme.js'
import { exec, toast, debugLog } from '@/helpers/KernelSU.js'
import { demoteApks, promoteApks } from '@/helpers/MicroG.js'
import StatusCard from '@/components/StatusCard.vue'
import PullToRefresh from '@/components/PullToRefresh.vue'

const { t } = useI18n()
const status = useStatusStore()
const themeStore = useThemeStore()
const settingsOpen = ref(false)

const isActive = computed(() =>
  status.moduleActive && status.gmsPromoted && status.companionPromoted
)

onMounted(async () => {
  await debugLog('Home.vue', '✓ mounted, fetching status')
  status.fetchStatus()
})

async function onRefresh(done) {
  await status.fetchStatus()
  done()
}

async function toggleModule() {
  if (status.loading) return
  const direction = status.moduleActive ? 'disable' : 'enable'
  await debugLog('Home.vue', `toggleModule: ${direction}`)
  const modulePath = '/data/adb/modules/microg_installer_revived_again'
  try {
    if (status.moduleActive) {
      await debugLog('Home.vue', 'toggleModule: demoting APKs...')
      await demoteApks()
      await debugLog('Home.vue', '✓ toggleModule: APKs demoted, creating disable file...')
      await exec(`touch '${modulePath}/disable'`)
      await debugLog('Home.vue', '✓ toggleModule: disabled successfully')
      toast(t('toast.module_disabled_reboot'))
    } else {
      await debugLog('Home.vue', 'toggleModule: removing disable file...')
      await exec(`rm -f '${modulePath}/disable'`)
      await debugLog('Home.vue', '✓ toggleModule: disable file removed, promoting APKs...')
      await promoteApks()
      await debugLog('Home.vue', '✓ toggleModule: enabled successfully')
      toast(t('toast.module_enabled_reboot'))
    }
    await status.fetchStatus()
  } catch (err) {
    await debugLog('Home.vue', `✗ toggleModule: FAILED — ${err.message}`)
    toast(t('toast.failed_toggle_module'))
  }
}

function openMicroGSettings() {
  exec('am start -n com.google.android.gms/org.microg.gms.ui.SettingsActivity').catch(() => {
    exec('am start -a android.intent.action.MAIN -p com.google.android.gms')
  })
}
</script>

<style scoped>
.status-active {
  background: rgba(122, 252, 255, 0.08);
  border: 1px solid rgba(122, 252, 255, 0.25);
}

.status-inactive {
  background: rgba(255, 100, 100, 0.08);
  border: 1px solid rgba(255, 100, 100, 0.25);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot-active {
  background: #7afcff;
  box-shadow: 0 0 8px rgba(122, 252, 255, 0.6);
}

.status-dot-inactive {
  background: #ff6464;
  box-shadow: 0 0 8px rgba(255, 100, 100, 0.6);
}

.status-dot-loading {
  background: rgba(255, 255, 255, 0.3);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.settings-dialog {
  margin: 0 24px;
  width: 100%;
  max-width: 320px;
  border-radius: 16px;
  background: var(--dialog-bg);
  border: 1px solid var(--dialog-border);
  padding: 20px;
}

.settings-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-on-surface-variant);
}

.settings-select {
  display: block;
  width: 100%;
  margin-top: 6px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--input-border);
  background-color: var(--input-bg);
  color: var(--input-color);
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  background-image: var(--select-arrow);
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.settings-select option {
  background: var(--dialog-bg);
  color: var(--input-color);
}

.settings-slider {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  appearance: none;
  -webkit-appearance: none;
  background: var(--input-border);
  outline: none;
  margin-top: 8px;
}

.settings-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
}

.toggle-switch {
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background-color: var(--input-border);
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle-active {
  background-color: var(--color-primary);
}

.toggle-knob {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: white;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.toggle-active .toggle-knob {
  transform: translateX(18px);
}
</style>
