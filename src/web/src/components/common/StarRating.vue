<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  rating: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
}>(), {
  size: 'md',
  interactive: false,
})

const emit = defineEmits<{
  (e: 'update', value: number): void
}>()

const sizeClass = computed(() => ({
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-8 h-8',
}[props.size]))

const gapClass = computed(() => ({
  sm: 'gap-0.5',
  md: 'gap-0.5',
  lg: 'gap-1',
}[props.size]))

// Each star can be: empty (0), quarter (0.25), half (0.5), three-quarter (0.75), full (1)
const stars = computed(() => {
  const result: number[] = []
  let remaining = props.rating
  for (let i = 0; i < 5; i++) {
    if (remaining >= 1) {
      result.push(1)
      remaining -= 1
    } else if (remaining > 0) {
      result.push(Math.round(remaining * 4) / 4)
      remaining = 0
    } else {
      result.push(0)
    }
  }
  return result
})

function handleClick(starIndex: number, event: MouseEvent) {
  if (!props.interactive) return
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = event.clientX - rect.left
  const fraction = x / rect.width
  // Snap to quarter increments
  let quarter = Math.ceil(fraction * 4) / 4
  if (quarter < 0.25) quarter = 0.25
  const value = starIndex + quarter
  emit('update', value)
}

// Unique clip IDs per star fill level
function clipId(starIdx: number) {
  return `star-clip-${starIdx}-${Math.round(stars.value[starIdx] * 100)}`
}
</script>

<template>
  <div class="flex items-center" :class="[gapClass, interactive ? 'cursor-pointer' : '']">
    <svg
      v-for="(fill, i) in stars"
      :key="i"
      :class="sizeClass"
      viewBox="0 0 20 20"
      @click="handleClick(i, $event)"
    >
      <defs>
        <clipPath :id="clipId(i)">
          <rect x="0" y="0" :width="fill * 20" height="20" />
        </clipPath>
      </defs>
      <!-- Empty star background -->
      <path
        class="text-stone-700"
        fill="currentColor"
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      />
      <!-- Filled star (clipped) -->
      <path
        v-if="fill > 0"
        class="text-amber-500"
        fill="currentColor"
        :clip-path="`url(#${clipId(i)})`"
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      />
    </svg>
  </div>
</template>
