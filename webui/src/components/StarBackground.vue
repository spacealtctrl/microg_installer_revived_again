<template>
  <canvas ref="canvas" class="star-canvas"></canvas>
</template>

<script setup>

import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let ctx, stars, animId

const STAR_COUNT = 200

function createStar(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    radius: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.5 + 0.5,
    speed: Math.random() * 0.01 + 0.005,
    twinkleSpeed: Math.random() * 0.02 + 0.01,
    twinklePhase: Math.random() * Math.PI * 2,
    spikes: 5
  }
}

function drawStarShape(cx, cy, spikes, outerRadius, innerRadius, opacity) {
  let rot = Math.PI / 2 * 3
  const step = Math.PI / spikes
  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius)
    rot += step
    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius)
    rot += step
  }
  ctx.closePath()
  ctx.fillStyle = 'white'
  ctx.globalAlpha = opacity
  ctx.fill()
}

function animate() {
  if (!ctx) return
  const w = canvas.value.width
  const h = canvas.value.height

  ctx.clearRect(0, 0, w, h)

  stars.forEach((star) => {
    star.twinklePhase += star.twinkleSpeed
    const opacity = star.opacity * (0.5 + 0.5 * Math.sin(star.twinklePhase))
    drawStarShape(star.x, star.y, star.spikes, star.radius, star.radius / 2, opacity)
    star.y -= star.speed
    if (star.y < 0) {
      star.y = h
      star.x = Math.random() * w
    }
  })
  ctx.globalAlpha = 1

  animId = requestAnimationFrame(animate)
}

function resize() {
  if (!canvas.value) return
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
  const w = canvas.value.width
  const h = canvas.value.height
  stars = []
  for (let i = 0; i < STAR_COUNT; i++) stars.push(createStar(w, h))
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  stars = []
  resize()
  animId = requestAnimationFrame(animate)
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.star-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>
