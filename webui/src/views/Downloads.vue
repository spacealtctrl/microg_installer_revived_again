<template>
  <PullToRefresh @refresh="onRefresh">
    <div class="space-y-4">
      <div class="rounded-2xl bg-surface-container p-4">
        <h1 class="text-xl font-semibold text-on-surface">{{ $t('installer.title') }}</h1>

        <div v-if="releases.loading" class="mt-4">
          <LoadingSpinner />
        </div>

        <div v-else-if="releases.error" class="mt-4">
          <p class="text-error">{{ releases.error }}</p>
          <button
            class="mt-3 rounded-full bg-primary px-4 py-2 text-sm font-medium text-on-primary"
            @click="releases.fetchReleases()"
          >
            {{ $t('installer.retry') }}
          </button>
        </div>

        <div v-else class="mt-3 space-y-3">
          <p v-if="releases.filteredReleases.length === 0" class="text-on-surface-variant">
            {{ $t('installer.no_releases') }}
          </p>
          <ReleaseCard
            v-for="release in releases.filteredReleases"
            :key="release.id"
            :release="release"
            :download-progress="releases.downloadProgress"
            @install="handleInstall"
            @uninstall="handleUninstall"
          />

          <button
            v-if="releases.hasMore"
            class="w-full rounded-xl bg-surface-container-low px-4 py-2.5 text-center text-sm font-medium text-on-surface-variant active:opacity-80"
            @click="releases.loadMore()"
          >
            {{ $t('installer.more') }}
          </button>
        </div>
      </div>

      <div class="rounded-2xl bg-surface-container p-4">
        <button
          class="flex w-full items-center justify-center gap-2 active:opacity-80"
          @click="metaOpen = !metaOpen"
        >
          <span class="text-sm font-medium text-on-surface-variant">{{ $t('installer.metamodules') }}</span>
          <svg
            class="h-4 w-4 text-on-surface-variant transition-transform"
            :class="metaOpen ? 'rotate-180' : ''"
            viewBox="0 0 24 24" fill="currentColor"
          >
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
          </svg>
        </button>

        <div v-if="metaOpen" class="mt-3 space-y-2">
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="meta in metamodules.slice(0, 3)"
              :key="meta.name"
              class="rounded-xl px-2 py-2.5 text-center active:opacity-80"
              :class="isCurrentMeta(meta.name) ? 'meta-active' : 'bg-surface-container-low'"
              @click="openWebsite(meta.url)"
            >
              <p class="text-xs font-medium" :class="isCurrentMeta(meta.name) ? 'text-white' : 'text-on-surface'">{{ meta.name }}</p>
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="meta in metamodules.slice(3)"
              :key="meta.name"
              class="rounded-xl px-2 py-2.5 text-center active:opacity-80"
              :class="isCurrentMeta(meta.name) ? 'meta-active' : 'bg-surface-container-low'"
              @click="openWebsite(meta.url)"
            >
              <p class="text-xs font-medium" :class="isCurrentMeta(meta.name) ? 'text-white' : 'text-on-surface'">{{ meta.name }}</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  </PullToRefresh>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { useStatusStore } from '@/stores/Status.js'
import { useReleasesStore } from '@/stores/Releases.js'
import { toast, openWebsite, debugLog } from '@/helpers/KernelSU.js'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ReleaseCard from '@/components/ReleaseCard.vue'
import PullToRefresh from '@/components/PullToRefresh.vue'

import { useI18n } from 'vue-i18n'

const status = useStatusStore()
const releases = useReleasesStore()
const { t } = useI18n()
const metaOpen = ref(false)

const metamodules = [
  { name: 'mountify', url: 'https://github.com/backslashxx/mountify' },
  { name: 'overlayfs', url: 'https://github.com/KernelSU-Modules-Repo/meta-overlayfs' },
  { name: 'magic mount', url: 'https://github.com/KernelSU-Modules-Repo/meta-mm' },
  { name: 'magic mount rs', url: 'https://github.com/Tools-cx-app/meta-magic_mount-rs' },
  { name: 'hybrid mount', url: 'https://github.com/Hybrid-Mount/meta-hybrid_mount' }
]

onMounted(async () => {
  await debugLog('Downloads.vue', '✓ mounted')
  if (!status.deviceType) {
    await debugLog('Downloads.vue', 'no deviceType cached, fetching status first...')
    await status.fetchStatus()
    await debugLog('Downloads.vue', '✓ status fetched')
  }
  await debugLog('Downloads.vue', '✓ fetching releases...')
  releases.fetchReleases()
})

async function onRefresh(done) {
  await debugLog('Downloads.vue', 'pull-to-refresh triggered')
  await Promise.all([
    status.fetchStatus(),
    releases.fetchReleases()
  ])
  await debugLog('Downloads.vue', '✓ pull-to-refresh complete')
  done()
}

async function handleInstall(asset) {
  await debugLog('Downloads.vue', `✓ install triggered: ${asset.name}`)
  toast(t('toast.installing', { name: asset.name }))
  releases.downloadAndInstall(asset)
}

async function handleUninstall(asset) {
  await debugLog('Downloads.vue', `✓ uninstall triggered: ${asset.name}`)
  toast(t('toast.uninstalling', { name: asset.name }))
  releases.uninstallAsset(asset)
}

function isCurrentMeta(name) {
  if (!status.metamoduleName) return false
  const normalize = (s) => s.toLowerCase().replace(/[_\-\s]+/g, ' ').trim()
  return normalize(status.metamoduleName) === normalize(name)
}
</script>

<style scoped>
.meta-active {
  background: rgba(120, 219, 122, 0.15);
  border: 1px solid rgba(120, 219, 122, 0.4);
}
</style>
