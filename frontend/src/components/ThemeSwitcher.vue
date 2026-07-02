<template>
  <div class="theme-switcher">
    <button
      class="theme-trigger"
      @click="open = !open"
      @keydown.esc="close"
      aria-label="Changer de thème"
      title="Changer de thème"
    >
      <span class="theme-trigger__dot" />
    </button>

    <Transition name="panel">
      <div v-if="open" class="theme-panel card">
        <button
          v-for="t in themes"
          :key="t.id"
          class="theme-swatch"
          :class="{ 'theme-swatch--active': current === t.id }"
          :style="{ background: t.color }"
          :title="t.label"
          @click="select(t.id)"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const themes = [
  { id: 'slate', label: 'Slate', color: '#6e85a6' },
  { id: 'sage', label: 'Sage', color: '#7a9b7e' },
  { id: 'brass', label: 'Brass', color: '#c2914b' },
  { id: 'coral', label: 'Coral', color: '#e8624a' },
  { id: 'violet', label: 'Violet', color: '#8c6fc9' },
  { id: 'cyan', label: 'Cyan', color: '#4fb3bf' },
]

const open = ref(false)
const current = ref('slate')
const root = ref<HTMLElement | null>(null)

function select(id: string) {
  current.value = id
  document.documentElement.setAttribute('data-theme', id)
  localStorage.setItem('cg-theme', id)
  open.value = false
}

function close() {
  open.value = false
}

function handleClickOutside(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  const saved = localStorage.getItem('cg-theme')
  if (saved) {
    current.value = saved
    document.documentElement.setAttribute('data-theme', saved)
  }
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.theme-switcher {
  position: relative;
  display: flex;
  align-items: center;
}

.theme-trigger {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition: var(--ease);
}

.theme-trigger:hover {
  border-color: var(--border-hover);
}

.theme-trigger__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  transition: var(--ease);
}

.theme-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2);
  z-index: 10;
}

.theme-swatch {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: var(--ease);
}

.theme-swatch:hover {
  transform: scale(1.15);
}

.theme-swatch--active {
  border-color: var(--text);
}

/* Transition d'apparition du panel */
.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>