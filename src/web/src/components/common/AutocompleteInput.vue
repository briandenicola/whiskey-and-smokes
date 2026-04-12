<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: string
  suggestions: string[]
  placeholder?: string
  inputClass?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'select': [value: string]
}>()

const showDropdown = ref(false)
const wrapperRef = ref<HTMLDivElement>()

const filtered = computed(() => {
  const q = props.modelValue.toLowerCase().trim()
  if (!q) return props.suggestions.slice(0, 8)
  return props.suggestions
    .filter(s => s.toLowerCase().includes(q))
    .slice(0, 8)
})

function select(value: string) {
  emit('update:modelValue', value)
  emit('select', value)
  showDropdown.value = false
}

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
  showDropdown.value = true
}

function onFocus() {
  if (props.suggestions.length) showDropdown.value = true
}

function closeOnClickOutside(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(() => document.addEventListener('click', closeOnClickOutside))
onUnmounted(() => document.removeEventListener('click', closeOnClickOutside))
</script>

<template>
  <div ref="wrapperRef" class="relative">
    <input
      ref="inputRef"
      :value="modelValue"
      :placeholder="placeholder"
      :class="inputClass || 'w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-3 text-white placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c]'"
      @input="onInput"
      @focus="onFocus"
    />
    <div
      v-if="showDropdown && filtered.length"
      class="absolute left-0 right-0 top-full mt-1 bg-[#041e3e] border border-[#1e407c]/50 rounded-xl overflow-hidden shadow-lg z-20 max-h-48 overflow-y-auto"
    >
      <button
        v-for="item in filtered"
        :key="item"
        @mousedown.prevent="select(item)"
        class="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-[#0a2a52] transition-colors truncate"
      >
        {{ item }}
      </button>
    </div>
  </div>
</template>
