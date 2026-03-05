
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStatusStore } from './Status.js'
import { debugLog } from '@/helpers/KernelSU.js'
import { i18n } from '@/i18n.js'
import {
  fetchReleases as apiFetchReleases,
  filterAssetsForDevice,
  getPackageName,
  downloadApk,
  installApk,
  uninstallPackage
} from '@/helpers/MicroG.js'
import { toast } from '@/helpers/KernelSU.js'

const TAG = 'Releases.js'

export const useReleasesStore = defineStore('releases', () => {
  const status = useStatusStore()
  const { t } = i18n.global

  const allReleases = ref([])
  const loading = ref(false)
  const error = ref('')
  const extraCount = ref(0)
  const downloadProgress = ref({})

  const baseCount = 3

  const filteredReleases = computed(() => {
    const all = allReleases.value
    if (!all.length) return []

    const installedGmsTag = status.gmsVersionName ? `v${status.gmsVersionName}` : ''
    const installedCompanionCode = status.companionVersionCode || ''

    const cutoff = all.findIndex(r => r.tag_name === minTag)
    const max = cutoff !== -1 ? cutoff + 1 : all.length
    const end = Math.min(baseCount + extraCount.value, max)
    const visible = all.slice(0, end)

    return visible.map((release, i) => {
      const isGmsCurrent = status.gmsInstalled && status.gmsIsMicroG && installedGmsTag && release.tag_name === installedGmsTag
      let releaseHasMatchingCompanion = false

      const processedAssets = filterAssetsForDevice(release.assets, status.deviceType)
        .sort((a, b) => {
          const pkgA = getPackageName(a.name)
          const pkgB = getPackageName(b.name)
          if (pkgA === 'com.google.android.gms' && pkgB !== 'com.google.android.gms') return -1
          if (pkgA !== 'com.google.android.gms' && pkgB === 'com.google.android.gms') return 1
          if (pkgA === 'com.android.vending' && pkgB !== 'com.android.vending') return -1
          if (pkgA !== 'com.android.vending' && pkgB === 'com.android.vending') return 1
          return 0
        })
        .map(asset => {
          const pkg = getPackageName(asset.name)
          let isAssetCurrent = false

          if (pkg === 'com.google.android.gms') {
            isAssetCurrent = isGmsCurrent
          } else if (pkg === 'com.android.vending') {
            const match = asset.name.match(/-(\d+)/)
            if (match && status.companionInstalled && !status.companionIsReal && installedCompanionCode === match[1]) {
              isAssetCurrent = true
              releaseHasMatchingCompanion = true
            }
          }

          return {
            ...asset,
            isCurrent: isAssetCurrent
          }
        })

      return {
        ...release,
        isLatest: i === 0,
        isCurrent: isGmsCurrent || releaseHasMatchingCompanion,
        assets: processedAssets
      }
    })
  })

  const minTag = 'v0.3.1.240913'

  const maxVisible = computed(() => {
    const cutoff = allReleases.value.findIndex(r => r.tag_name === minTag)
    return cutoff !== -1 ? cutoff + 1 : allReleases.value.length
  })

  const hasMore = computed(() => {
    return baseCount + extraCount.value < maxVisible.value
  })

  function loadMore() {
    extraCount.value += 5
  }

  function reset() {
    extraCount.value = 0
    downloadProgress.value = {}
  }

  async function fetchReleases() {
    await debugLog(TAG, 'fetchReleases: START')
    loading.value = true
    error.value = ''
    reset()
    try {
      allReleases.value = await apiFetchReleases()
      await debugLog(TAG, `✓ fetchReleases: loaded ${allReleases.value.length} releases`)
    } catch (err) {
      error.value = err.message || t('error.fetch_releases')
      await debugLog(TAG, `✗ fetchReleases: ERROR ${err.message}`)
    } finally {
      loading.value = false
    }
  }

  async function downloadAndInstall(asset) {
    const name = asset.name
    await debugLog(TAG, `downloadAndInstall: START ${name}`)
    downloadProgress.value = { ...downloadProgress.value, [name]: { status: 'downloading' } }
    try {
      const destPath = `/data/local/tmp/${name}`
      await debugLog(TAG, `✓ downloadAndInstall: downloading ${asset.browser_download_url}`)
      await downloadApk(asset.browser_download_url, destPath)

      downloadProgress.value = { ...downloadProgress.value, [name]: { status: 'installing' } }
      await debugLog(TAG, `✓ downloadAndInstall: installing ${destPath}`)
      await installApk(destPath)

      downloadProgress.value = { ...downloadProgress.value, [name]: { status: 'cleaning' } }
      await debugLog(TAG, `✓ downloadAndInstall: refreshing status`)
      await status.fetchStatus()

      downloadProgress.value = { ...downloadProgress.value, [name]: { status: 'done' } }
      await debugLog(TAG, `✓ downloadAndInstall: DONE ${name}`)
      toast(t('toast.installed_success', { name }))
    } catch (err) {
      downloadProgress.value = { ...downloadProgress.value, [name]: { status: 'error', error: err.message } }
      await debugLog(TAG, `✗ downloadAndInstall: ERROR ${name} — ${err.message}`)
      toast(t('toast.install_failed', { name }))
    }
  }

  async function uninstallAsset(asset) {
    const name = asset.name
    const pkg = getPackageName(name)
    if (!pkg) return

    await debugLog(TAG, `uninstallAsset: START ${pkg}`)
    downloadProgress.value = { ...downloadProgress.value, [name]: { status: 'uninstalling' } }
    try {
      await uninstallPackage(pkg)
      await status.fetchStatus()
      downloadProgress.value = { ...downloadProgress.value, [name]: { status: 'uninstalled' } }
      await debugLog(TAG, `✓ uninstallAsset: DONE ${pkg}`)
      toast(t('toast.uninstalled_success', { name: pkg }))
    } catch (err) {
      downloadProgress.value = { ...downloadProgress.value, [name]: { status: 'error', error: err.message } }
      await debugLog(TAG, `✗ uninstallAsset: ERROR ${pkg} — ${err.message}`)
      toast(t('toast.uninstall_failed', { name: pkg }))
    }
  }

  return {
    allReleases,
    loading,
    error,
    extraCount,
    downloadProgress,
    filteredReleases,
    hasMore,
    loadMore,
    reset,
    fetchReleases,
    downloadAndInstall,
    uninstallAsset
  }
})
