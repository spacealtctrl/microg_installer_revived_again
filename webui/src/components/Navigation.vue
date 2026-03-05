<template>
  <nav class="nav-glass fixed bottom-0 left-0 right-0 z-10">
    <div class="flex">
      <router-link
        v-for="item in visibleItems"
        :key="item.to"
        :to="item.to"
        class="nav-tab flex flex-1 flex-col items-center gap-0.5 pt-3 text-xs transition-colors"
        :class="
          $route.path === item.to
            ? 'text-primary'
            : 'text-on-surface-variant'
        "
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path :d="item.icon" />
        </svg>
        <span>{{ $t(item.labelKey) }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>

import { computed } from 'vue'
import { useThemeStore } from '@/stores/Theme.js'

const themeStore = useThemeStore()

const visibleItems = computed(() => {
  const base = [
    {
      to: '/',
      labelKey: 'nav.home',
      icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'
    },
    {
      to: '/downloads',
      labelKey: 'nav.installer',
      icon: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'
    }
  ]

  if (themeStore.debugLogging) {
    base.push({
      to: '/logs',
      labelKey: 'nav.logs',
      icon: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'
    })
  }

  base.push({
    to: '/settings',
    labelKey: 'nav.settings',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'
  })

  return base
})
</script>

<style scoped>
.nav-glass {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.6));
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
}

.nav-tab {
  padding-bottom: var(--bottom-padding, 40px);
}
</style>
