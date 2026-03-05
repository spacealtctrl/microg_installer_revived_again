<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between px-1">
      <h1 class="text-xl font-bold text-on-surface">{{ $t('logs.title') }}</h1>
      <div class="flex gap-2">
        <button
          class="rounded-xl bg-surface-container px-3 py-1.5 text-xs font-medium text-on-surface-variant active:opacity-80"
          @click="refresh"
        >
          {{ $t('logs.refresh') }}
        </button>
        <button
          class="rounded-xl bg-surface-container px-3 py-1.5 text-xs font-medium text-on-surface-variant active:opacity-80"
          :class="copied ? 'text-primary' : ''"
          @click="copyLog"
        >
          {{ copied ? $t('logs.copied') : $t('logs.copy') }}
        </button>
        <button
          class="rounded-xl bg-surface-container px-3 py-1.5 text-xs font-medium text-error active:opacity-80"
          @click="clear"
        >
          {{ $t('logs.clear') }}
        </button>
      </div>
    </div>

    <div class="rounded-2xl bg-surface-container p-4">
      <div v-if="loading" class="text-center text-sm text-on-surface-variant">{{ $t('logs.loading') }}</div>
      <div v-else-if="!logContent" class="text-center text-sm text-on-surface-variant">
        {{ $t('logs.empty') }}
      </div>
      <pre
        v-else
        ref="logPre"
        class="log-viewer overflow-x-auto whitespace-pre-wrap break-words text-xs leading-relaxed text-on-surface-variant"
      >{{ logContent }}</pre>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { readLog, clearLog, debugLog } from '@/helpers/KernelSU.js'

const { t } = useI18n()
const logContent = ref('')
const loading = ref(false)
const copied = ref(false)
const logPre = ref(null)

async function refresh() {
  loading.value = true
  try {
    logContent.value = await readLog()
    await debugLog('Logs.vue', '✓ log refreshed')
  } catch {
    logContent.value = t('logs.error_read')
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

async function copyLog() {
  if (!logContent.value) return
  try {
    await navigator.clipboard.writeText(logContent.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = logContent.value
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

async function clear() {
  await clearLog()
  await debugLog('Logs.vue', '✓ log cleared')
  await refresh()
}

function scrollToBottom() {
  if (logPre.value) {
    logPre.value.scrollTop = logPre.value.scrollHeight
  }
}

onMounted(() => {
  refresh()
})
</script>

<style scoped>
.log-viewer {
  max-height: 70vh;
  overflow-y: auto;
  font-family: 'Courier New', Courier, monospace;
}
</style>
