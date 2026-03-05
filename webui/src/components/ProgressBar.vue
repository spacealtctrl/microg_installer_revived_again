<template>
  <div class="w-full">
    <div class="h-1.5 w-full overflow-hidden rounded-full bg-surface-variant">
      <div
        class="h-full rounded-full bg-primary transition-all duration-300"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
    <p v-if="showLabel" class="mt-1 text-right text-xs text-on-surface-variant">
      {{ progress }}%
    </p>
  </div>
</template>

<script setup>
defineProps({
  progress: {
    type: Number,
    default: 0
  },
  showLabel: {
    type: Boolean,
    default: false
  }
})
</script>
