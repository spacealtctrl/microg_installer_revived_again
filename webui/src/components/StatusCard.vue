<template>
  <div class="rounded-2xl bg-surface-container p-4">
    <LoadingSpinner v-if="status.loading" />

    <p v-else-if="status.error" class="text-sm text-error">{{ status.error === 'Failed' ? $t('status.failed') : status.error }}</p>

    <div v-else class="space-y-3">
      <div class="flex items-start gap-3 rounded-xl bg-surface-container-low p-3">
        <div
          class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
          :class="gmsGreen ? 'bg-success' : 'bg-error'"
        ></div>
        <div class="min-w-0 flex-1">
          <p class="font-medium text-on-surface">{{ $t('status.microg_gmscore') }}</p>
          <p class="text-sm text-on-surface-variant">
            <template v-if="!status.gmsInstalled">{{ $t('status.not_installed') }}</template>
            <template v-else-if="!status.gmsIsMicroG">{{ $t('status.play_services_detected') }}</template>
            <template v-else>v{{ status.gmsVersionName }}</template>
          </p>
        </div>
      </div>

      <div class="flex items-start gap-3 rounded-xl bg-surface-container-low p-3">
        <div
          class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
          :class="companionGreen ? 'bg-success' : 'bg-error'"
        ></div>
        <div class="min-w-0 flex-1">
          <p class="font-medium text-on-surface">
            <template v-if="!status.companionInstalled">{{ $t('status.microg_companion_play') }}</template>
            <template v-else-if="status.companionIsReal">{{ $t('status.play_store') }}</template>
            <template v-else>{{ $t('status.microg_companion') }}</template>
          </p>
          <p class="text-sm text-on-surface-variant">
            <template v-if="!status.companionInstalled">{{ $t('status.not_installed') }}</template>
            <template v-else>v{{ status.companionVersionName }}</template>
          </p>
        </div>
      </div>

      <div v-if="status.metamoduleName" class="flex items-start gap-3 rounded-xl bg-surface-container-low p-3">
        <div
          class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success"
        ></div>
        <div class="min-w-0 flex-1">
          <p class="font-medium text-on-surface">{{ $t('status.metamodule') }}</p>
          <p class="text-sm text-on-surface-variant">
            {{ status.metamoduleName }}
          </p>
        </div>
      </div>

      <button
        class="flex w-full items-start gap-3 rounded-xl p-3 text-left active:opacity-80"
        :class="[promotedGreen ? 'bg-surface-container-low' : canPromote ? 'promote-btn' : 'bg-surface-container-low', holdProgress > 0 ? 'holding' : '']"
        :style="{ '--progress': `${holdProgress}%` }"
        :disabled="promoting || (!promotedGreen && !canPromote)"
        @touchstart="startHold"
        @touchend="cancelHold"
        @touchcancel="cancelHold"
        @mousedown="startHold"
        @mouseup="cancelHold"
        @mouseleave="cancelHold"
      >
        <div
          class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
          :class="promotedGreen ? 'bg-success' : promoting ? 'bg-warning' : 'bg-error'"
        ></div>
        <div class="min-w-0 flex-1">
          <p class="font-medium text-on-surface">
            <template v-if="promoting">{{ $t('status.promoting') }}</template>
            <template v-else-if="promotedGreen">{{ $t('status.promoted') }}</template>
            <template v-else>{{ $t('status.promote') }}</template>
          </p>
          <p v-if="promoteSubtext" class="text-sm text-on-surface-variant" v-html="promoteSubtext"></p>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>

import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStatusStore } from '@/stores/Status.js'
import { promoteApks, demoteApks } from '@/helpers/MicroG.js'
import { toast, debugLog } from '@/helpers/KernelSU.js'
import LoadingSpinner from './LoadingSpinner.vue'

const { t } = useI18n()
const status = useStatusStore()
const promoting = ref(false)

const holdTimer = ref(null)
const holdProgress = ref(0)
let holdStartTime = 0
let animFrame = null

const gmsGreen = computed(() =>
  status.gmsInstalled && status.gmsIsMicroG
)

const companionGreen = computed(() =>
  status.companionInstalled
)

const promotedGreen = computed(() =>
  status.gmsPromoted && status.companionPromoted
)

const canPromote = computed(() =>
  gmsGreen.value && companionGreen.value && !promotedGreen.value
)

const promoteSubtext = computed(() => {
  if (promoting.value) return ''
  if (promotedGreen.value) {
    const appName = status.companionIsReal ? t('status.play_store') : t('status.companion')
    return t('status.promote_subtext_demote', { app: appName })
  }
  if (canPromote.value) return t('status.promote_subtext_promote')
  return ''
})

function updateProgress() {
  const elapsed = Date.now() - holdStartTime
  holdProgress.value = Math.min((elapsed / 2500) * 100, 100)
  
  if (holdProgress.value < 100) {
    animFrame = requestAnimationFrame(updateProgress)
  }
}

function startHold(e) {
  if (promoting.value || (!promotedGreen.value && !canPromote.value)) return
  if (e.type === 'touchstart') e.preventDefault()
  
  cancelHold()
  
  holdStartTime = Date.now()
  animFrame = requestAnimationFrame(updateProgress)
  
  holdTimer.value = setTimeout(() => {
    cancelHold()
    handlePromoteClick()
  }, 2500)
}

function cancelHold() {
  if (holdTimer.value) clearTimeout(holdTimer.value)
  if (animFrame) cancelAnimationFrame(animFrame)
  holdTimer.value = null
  holdProgress.value = 0
}

async function handlePromoteClick() {
  if (promoting.value) return

  const action = promotedGreen.value ? 'demote' : 'promote'
  await debugLog('StatusCard.vue', `handlePromoteClick: action=${action}`)
  promoting.value = true
  try {
    if (promotedGreen.value) {
      await demoteApks()
      await status.fetchStatus()
      await debugLog('StatusCard.vue', '✓ handlePromoteClick: demoted successfully')
      toast(t('toast.demoted_reboot'))
    } else {
      await promoteApks()
      await status.fetchStatus()
      await debugLog('StatusCard.vue', '✓ handlePromoteClick: promoted successfully')
      toast(t('toast.promoted_reboot'))
    }
  } catch (err) {
    await debugLog('StatusCard.vue', `✗ handlePromoteClick: FAILED — ${err.message}`)
    toast(t('toast.failed'))
  } finally {
    promoting.value = false
  }
}
</script>

<style scoped>
.promote-btn {
  background: rgba(122, 252, 255, 0.06);
  border: 1px solid rgba(122, 252, 255, 0.15);
}

.holding {
  position: relative;
  overflow: hidden;
}

.holding::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: var(--progress, 0%);
  background: rgba(122, 252, 255, 0.15);
  transition: width 0.1s linear;
  z-index: 0;
}

.holding > * {
  position: relative;
  z-index: 1;
}
</style>
