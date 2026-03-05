<template>
  <div class="flex items-center gap-3 rounded-xl bg-surface-container-low px-3 py-2.5">
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium text-on-surface">{{ asset.name }}</p>
      <p class="text-xs text-on-surface-variant">{{ formattedSize }}</p>
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <span v-if="assetStatus?.status === 'downloading'" class="status-pill downloading">
        {{ $t('apk.downloading') }}
      </span>
      <span v-else-if="assetStatus?.status === 'installing'" class="status-pill installing">
        {{ $t('apk.installing') }}
      </span>
      <span v-else-if="assetStatus?.status === 'cleaning'" class="status-pill installing">
        {{ $t('apk.finishing') }}
      </span>
      <span v-else-if="assetStatus?.status === 'uninstalling'" class="status-pill installing">
        {{ $t('apk.uninstalling') }}
      </span>
      <span v-else-if="assetStatus?.status === 'uninstalled'" class="status-pill done">
        {{ $t('apk.uninstalled') }}
      </span>
      <span v-else-if="assetStatus?.status === 'done'" class="status-pill done">
        {{ $t('apk.installed') }}
      </span>
      <span v-else-if="assetStatus?.status === 'error'" class="status-pill error">
        {{ $t('apk.failed') }}
      </span>
      <template v-else-if="isCurrent">
        <span class="status-pill done">{{ $t('apk.installed') }}</span>
        <button
          class="uninstall-btn"
          @click="confirmOpen = true"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </template>
      <button
        v-else
        class="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-on-primary"
        @click="$emit('install', asset)"
      >
        {{ $t('apk.install') }}
      </button>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="confirmOpen" class="confirm-overlay" @click.self="confirmOpen = false">
      <div class="confirm-dialog">
        <p class="text-sm font-medium text-on-surface">{{ $t('apk.confirm_uninstall_title') }}</p>
        <p class="mt-1 text-xs text-on-surface-variant">{{ asset.name }}</p>
        <div v-if="status.moduleActive" class="warning-box">
          <p class="warning-title">{{ $t('apk.warning_active_title') }}</p>
          <p class="warning-text">{{ $t('apk.warning_active_text') }}</p>
        </div>
        <div class="mt-4 flex gap-3 justify-end">
          <button
            class="rounded-full px-4 py-2 text-sm font-medium text-on-surface-variant active:opacity-80"
            @click="confirmOpen = false"
          >
            {{ $t('apk.cancel') }}
          </button>
          <button
            class="rounded-full bg-error px-4 py-2 text-sm font-medium text-on-primary active:opacity-80"
            @click="doUninstall"
          >
            {{ $t('apk.uninstall') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>

import { ref, computed } from 'vue'
import { useStatusStore } from '@/stores/Status.js'
import { formatFileSize } from '@/helpers/MicroG.js'

const props = defineProps({
  asset: {
    type: Object,
    required: true
  },
  assetStatus: {
    type: Object,
    default: null
  },
  isCurrent: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['install', 'uninstall'])
const status = useStatusStore()

const confirmOpen = ref(false)

function doUninstall() {
  confirmOpen.value = false
  emit('uninstall', props.asset)
}

const formattedSize = computed(() => formatFileSize(props.asset.size))
</script>

<style scoped>
.status-pill {
  font-size: 0.7rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 9999px;
  white-space: nowrap;
}

.downloading {
  color: #7afcff;
  background: rgba(122, 252, 255, 0.1);
  animation: pulse 1.5s ease-in-out infinite;
}

.installing {
  color: #FFD54F;
  background: rgba(255, 213, 79, 0.1);
  animation: pulse 1.5s ease-in-out infinite;
}

.done {
  color: #78DB7A;
  background: rgba(120, 219, 122, 0.1);
}

.error {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.uninstall-btn {
  color: #ff6b6b;
  opacity: 0.7;
  padding: 4px;
  border-radius: 50%;
  transition: opacity 0.15s;
}

.uninstall-btn:active {
  opacity: 1;
  background: rgba(255, 107, 107, 0.1);
}

.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.confirm-dialog {
  margin: 0 24px;
  width: 100%;
  max-width: 320px;
  border-radius: 16px;
  background: #1a1b20;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 20px;
}

.warning-box {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 100, 100, 0.1);
  border: 1px solid rgba(255, 100, 100, 0.25);
}

.warning-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #ff6b6b;
}

.warning-text {
  margin-top: 2px;
  font-size: 0.7rem;
  line-height: 1.4;
  color: rgba(255, 107, 107, 0.85);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
