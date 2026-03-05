<template>
  <StarBackground v-if="showStars" />
  <div
    id="content-wrapper"
    class="relative z-10 min-h-screen px-4 pt-16 pb-28"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <div :class="['tab-content', contentAnim]" @animationend="contentAnim = ''">
      <router-view />
    </div>
  </div>
  <Navigation />
</template>

<script setup>

import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import StarBackground from '@/components/StarBackground.vue'
import Navigation from '@/components/Navigation.vue'
import { useThemeStore } from '@/stores/Theme.js'
import { exec, toast } from '@/helpers/KernelSU.js'

const themeStore = useThemeStore()
const router = useRouter()
const route = useRoute()

const showStars = computed(() => themeStore.theme === 'space')

const visibleTabs = computed(() => {
  return themeStore.debugLogging 
    ? ['/', '/downloads', '/logs', '/settings']
    : ['/', '/downloads', '/settings']
})

watch(() => route.path, (path) => {
  document.documentElement.classList.toggle('no-scrollbar', path !== '/downloads' && path !== '/logs')
}, { immediate: true })
const contentAnim = ref('')

let touchStartX = 0
let touchStartY = 0
let backPressTime = 0

import { i18n } from '@/i18n.js'

router.beforeEach((to, from) => {
  const tabs = visibleTabs.value
  const toIdx = tabs.indexOf(to.path)
  const fromIdx = tabs.indexOf(from.path)
  if (toIdx !== -1 && fromIdx !== -1 && toIdx !== fromIdx) {
    contentAnim.value = toIdx > fromIdx ? 'anim-in-left' : 'anim-in-right'
  }
})

function navigateTab(to) {
  if (route.path === to) return
  router.push(to)
}

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY
  if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return
  const tabs = visibleTabs.value
  const current = tabs.indexOf(route.path)
  if (current === -1) return
  if (dx < 0 && current < tabs.length - 1) {
    navigateTab(tabs[current + 1])
  } else if (dx > 0 && current > 0) {
    navigateTab(tabs[current - 1])
  }
}

function exitModule() {
  try {
    exec("am start -a android.intent.action.MAIN -c android.intent.category.HOME")
  } catch {
  }
}

onMounted(() => {
  history.pushState({ module: true }, '', location.href)

  window.addEventListener('popstate', () => {
    history.pushState({ module: true }, '', location.href)

    const now = Date.now()
    if (now - backPressTime < 2000) {
      exitModule()
    } else {
      backPressTime = now
      toast(i18n.global.t('toast.press_back_exit'))
      return
    }
  })
})
</script>

<style>
.tab-content {
  animation-fill-mode: both;
}

.anim-in-left {
  animation: fadeInLeft 0.2s ease;
}

.anim-in-right {
  animation: fadeInRight 0.2s ease;
}

@keyframes fadeInLeft {
  from {
    opacity: 0.3;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0.3;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
