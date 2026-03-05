<template>
  <div class="mt-4 space-y-4">
    <div class="rounded-2xl bg-surface-container p-4">
      <div class="flex flex-col items-center pb-2">
        <img
          src="@/assets/microg.png"
          alt="microG"
          class="credit-icon"
        />
        <p class="mt-2 text-center text-lg font-bold text-on-surface">microG</p>
        <p class="text-center text-xs text-on-surface-variant">{{ $t('settings.microg_by') }}</p>
      </div>

      <p class="mt-3 text-center text-xs leading-relaxed text-on-surface-variant" v-html="$t('settings.microg_desc')"></p>

      <div class="mt-4 space-y-2">
        <button
          class="w-full rounded-xl bg-surface-container-low p-3 text-left"
          @click="openWebsite('https://github.com/microg/GmsCore')"
        >
          <p class="font-medium text-on-surface">{{ $t('settings.source_code') }}</p>
          <p class="text-sm text-primary">github.com/microg/GmsCore</p>
        </button>
        <button
          class="w-full rounded-xl bg-surface-container-low p-3 text-left"
          @click="openWebsite('https://microg.org')"
        >
          <p class="font-medium text-on-surface">{{ $t('settings.website') }}</p>
          <p class="text-sm text-primary">microg.org</p>
        </button>
      </div>
    </div>

    <div class="rounded-2xl bg-surface-container p-4">
      <div class="profile-orbit-wrapper">
        <div class="orbit-container">
          <div class="orbit orbit1"><div class="star"></div></div>
          <div class="orbit orbit2"><div class="star"></div></div>
          <img
            src="@/assets/spaceman.jpg"
            alt="spacealtctrl"
            class="profile-pic"
          />
        </div>
        <p class="mt-1 text-center text-lg font-bold text-on-surface">{{ $t('settings.module_title') }}</p>
        <p class="text-center text-xs text-on-surface-variant">{{ $t('settings.module_by') }}</p>
      </div>

      <div class="mt-4 space-y-2">
        <div class="rounded-xl bg-surface-container-low p-3">
          <p class="font-medium text-on-surface">{{ $t('settings.version') }}</p>
          <p class="text-sm text-on-surface-variant">v1.0.0-0</p>
        </div>
        <button
          class="w-full rounded-xl bg-surface-container-low p-3 text-left"
          @click="openWebsite('https://github.com/spacealtctrl/microg_installer_revived_again')"
        >
          <p class="font-medium text-on-surface">{{ $t('settings.source_code') }}</p>
          <p class="text-sm text-primary">github.com/spacealtctrl/microg_installer_revived_again</p>
        </button>
        <button
          class="w-full rounded-xl bg-surface-container-low p-3 text-left"
          @click="openWebsite('https://spacealtctrl.net/')"
        >
          <p class="font-medium text-on-surface">{{ $t('settings.website') }}</p>
          <p class="text-sm text-primary">spacealtctrl.net</p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>

import { openWebsite } from '@/helpers/KernelSU.js'
</script>

<style scoped>
.credit-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.15);
  object-fit: cover;
  background: #1a1a22;
}

.profile-orbit-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 8px;
}

.orbit-container {
  position: relative;
  width: 80px;
  height: 80px;
  perspective: 450px;
  transform-style: preserve-3d;
}

.profile-pic {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80px;
  height: 80px;
  margin-left: -40px;
  margin-top: -40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
  object-fit: cover;
  background: #1a1a22;
  z-index: 2;
}

.orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  transform-style: preserve-3d;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.08), inset 0 0 8px rgba(255, 255, 255, 0.05);
}

.orbit1 {
  width: 120px;
  height: 120px;
  margin-left: -60px;
  margin-top: -60px;
  animation: spinOrbit1 8s linear infinite, pulseOrbit 4s ease-in-out infinite;
}

.orbit2 {
  width: 150px;
  height: 150px;
  margin-left: -75px;
  margin-top: -75px;
  animation: spinOrbit2 12s linear infinite, pulseOrbit 5s ease-in-out infinite;
}

.star {
  position: absolute;
  width: 3px;
  height: 3px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 6px #fff, 0 0 12px rgba(255, 255, 255, 0.5);
  top: 0;
  left: 50%;
  margin-left: -1.5px;
  animation: twinkle 2s ease-in-out infinite;
}

.orbit2 .star {
  animation-delay: 0.5s;
}

@keyframes spinOrbit1 {
  from { transform: rotateX(72deg) rotateZ(0deg); }
  to { transform: rotateX(72deg) rotateZ(360deg); }
}

@keyframes spinOrbit2 {
  from { transform: rotateX(71deg) rotateZ(45deg); }
  to { transform: rotateX(71deg) rotateZ(405deg); }
}

@keyframes twinkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes pulseOrbit {
  0%, 100% {
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.08);
  }
  50% {
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.2);
  }
}
</style>
