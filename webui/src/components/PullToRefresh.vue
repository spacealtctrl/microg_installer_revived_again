<template>
  <div
    ref="container"
    class="pull-container"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div
      class="pull-indicator"
      :style="{ height: `${indicatorHeight}px`, opacity: indicatorOpacity }"
    >
      <svg
        class="pull-icon"
        :class="{ spinning: refreshing }"
        :style="{ transform: refreshing ? undefined : `rotate(${rotation}deg)` }"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
      </svg>
    </div>
    <div :style="{ transform: `translateY(${pullOffset}px)`, transition: pulling ? 'none' : 'transform 0.3s ease' }">
      <slot />
    </div>
  </div>
</template>

<script setup>

import { ref } from 'vue'

const emit = defineEmits(['refresh'])

const container = ref(null)
const pulling = ref(false)
const refreshing = ref(false)
const startY = ref(0)
const pullDistance = ref(0)

const threshold = 60
const maxPull = 100

const pullOffset = ref(0)
const indicatorHeight = ref(0)
const indicatorOpacity = ref(0)
const rotation = ref(0)

function isAtTop() {
  let el = container.value
  while (el) {
    if (el.scrollTop > 0) return false
    el = el.parentElement
  }
  return true
}

function onTouchStart(e) {
  if (refreshing.value) return
  if (!isAtTop()) return
  pulling.value = true
  startY.value = e.touches[0].clientY
  pullDistance.value = 0
}

function onTouchMove(e) {
  if (!pulling.value || refreshing.value) return
  const dy = e.touches[0].clientY - startY.value
  if (dy < 0) {
    pullDistance.value = 0
    pullOffset.value = 0
    indicatorHeight.value = 0
    indicatorOpacity.value = 0
    rotation.value = 0
    return
  }

  const damped = Math.min(dy * 0.5, maxPull)
  pullDistance.value = damped
  pullOffset.value = damped
  indicatorHeight.value = damped
  indicatorOpacity.value = Math.min(damped / threshold, 1)
  rotation.value = (damped / maxPull) * 360
}

function onTouchEnd() {
  if (!pulling.value) return
  pulling.value = false

  if (pullDistance.value >= threshold) {
    refreshing.value = true
    pullOffset.value = threshold * 0.6
    indicatorHeight.value = threshold * 0.6
    indicatorOpacity.value = 1

    emit('refresh', () => {
      refreshing.value = false
      pullOffset.value = 0
      indicatorHeight.value = 0
      indicatorOpacity.value = 0
      rotation.value = 0
    })
  } else {
    pullOffset.value = 0
    indicatorHeight.value = 0
    indicatorOpacity.value = 0
    rotation.value = 0
  }
}
</script>

<style scoped>
.pull-container {
  position: relative;
  overflow: visible;
}

.pull-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: height 0.3s ease, opacity 0.3s ease;
}

.pull-icon {
  width: 22px;
  height: 22px;
  color: rgba(255, 255, 255, 0.5);
}

.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
