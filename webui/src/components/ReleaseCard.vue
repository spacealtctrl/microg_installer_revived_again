<template>
  <div class="rounded-xl bg-surface-container-low p-3">
    <button
      class="flex w-full items-center justify-between text-left"
      @click="expanded = !expanded"
    >
      <div>
        <h3 class="flex items-center gap-2 font-medium text-on-surface">
          {{ release.tag_name }}
          <span
            v-if="release.isLatest"
            class="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-on-primary"
          >
            {{ $t('release.latest') }}
          </span>
          <span
            v-if="release.isCurrent"
            class="rounded-full bg-success px-2 py-0.5 text-xs font-medium text-on-primary"
          >
            {{ $t('release.current') }}
          </span>
        </h3>
        <p class="text-sm text-on-surface-variant">{{ formattedDate }}</p>
      </div>
      <svg
        class="h-5 w-5 shrink-0 text-on-surface-variant transition-transform duration-200"
        :class="{ 'rotate-180': expanded }"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <div v-if="expanded" class="mt-3 space-y-2">
      <p v-if="release.assets.length === 0" class="text-sm text-on-surface-variant">
        {{ $t('release.no_apks') }}
      </p>
      <ApkDownloadItem
        v-for="asset in release.assets"
        :key="asset.id"
        :asset="asset"
        :asset-status="downloadProgress[asset.name]"
        :is-current="asset.isCurrent"
        @install="$emit('install', $event)"
        @uninstall="$emit('uninstall', $event)"
      />
    </div>
  </div>
</template>

<script setup>

import { ref, computed } from 'vue'
import ApkDownloadItem from './ApkDownloadItem.vue'

const props = defineProps({
  release: {
    type: Object,
    required: true
  },
  downloadProgress: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['install', 'uninstall'])

const expanded = ref(false)

const formattedDate = computed(() => {
  const date = new Date(props.release.published_at)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
})
</script>
