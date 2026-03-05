
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { i18n } from '@/i18n.js'
import { debugLog } from '@/helpers/KernelSU.js'
import {
  getInstalledMicroG,
  getInstalledCompanion,
  getMetamodule,
  detectDevice,
  isModuleActive,
  isGmsInPrivApp,
  isCompanionInPrivApp
} from '@/helpers/MicroG.js'

const TAG = 'Status.js'

export const useStatusStore = defineStore('status', () => {
  const moduleActive = ref(false)

  const gmsInstalled = ref(false)
  const gmsVersionName = ref('')
  const gmsVersionCode = ref('')
  const gmsIsMicroG = ref(false)
  const gmsPromoted = ref(false)

  const companionInstalled = ref(false)
  const companionVersionName = ref('')
  const companionVersionCode = ref('')
  const companionIsReal = ref(false)
  const companionPromoted = ref(false)

  const metamoduleName = ref('')
  const deviceType = ref('standard')
  const loading = ref(false)
  const error = ref('')

  async function fetchStatus() {
    await debugLog(TAG, 'fetchStatus: START')
    loading.value = true
    error.value = ''
    try {
      const [active, gms, companion, meta, device, gmsPriv, companionPriv] = await Promise.all([
        isModuleActive(),
        getInstalledMicroG(),
        getInstalledCompanion(),
        getMetamodule(),
        detectDevice(),
        isGmsInPrivApp(),
        isCompanionInPrivApp()
      ])

      moduleActive.value = active

      gmsInstalled.value = gms.installed
      gmsVersionName.value = gms.versionName
      gmsVersionCode.value = gms.versionCode
      gmsIsMicroG.value = gms.isMicroG
      gmsPromoted.value = gmsPriv

      companionInstalled.value = companion.installed
      companionVersionName.value = companion.versionName
      companionVersionCode.value = companion.versionCode
      companionIsReal.value = companion.installed && !companion.isCompanion
      companionPromoted.value = companionPriv

      metamoduleName.value = meta
      deviceType.value = device

      await debugLog(TAG, `✓ fetchStatus: active=${active} gms=${gms.installed}/${gms.isMicroG}/${gmsPriv} companion=${companion.installed}/${companionPriv} meta=${meta} device=${device}`)
    } catch (err) {
      const { t } = i18n.global
      error.value = err.message || t('error.detection_failed')
      await debugLog(TAG, `✗ fetchStatus: ERROR ${err.message}`)
    } finally {
      loading.value = false
      await debugLog(TAG, '✓ fetchStatus: DONE')
    }
  }

  return {
    moduleActive,
    gmsInstalled,
    gmsVersionName,
    gmsVersionCode,
    gmsIsMicroG,
    gmsPromoted,
    companionInstalled,
    companionVersionName,
    companionVersionCode,
    companionIsReal,
    companionPromoted,
    metamoduleName,
    deviceType,
    loading,
    error,
    fetchStatus
  }
})
