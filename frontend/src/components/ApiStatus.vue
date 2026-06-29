<template>
  <div class="card" :class="state">
  <div class="header">
    <h2>API</h2>
    <span class="badge">{{ badge }}</span>
  </div>

    <p v-if="state === 'loading'">⏳ Checking API...</p>
    <p v-else-if="state === 'ok'">{{ message }}</p>
    <p v-else>❌ API ERROR</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const badge = computed(() => {
  if (state.value === 'ok') return 'OK'
  if (state.value === 'error') return 'ERROR'
  return 'LOADING'
})

const state = ref<'loading' | 'ok' | 'error'>('loading')
const message = ref('')

const API = import.meta.env.VITE_API_URL
console.log("API URL =", API)

async function checkAPI() {
  state.value = 'loading'

  try {
    const res = await fetch(`${API}/api/hello`)

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const data = await res.json()

    message.value = data.message
    state.value = 'ok'
  } catch (err) {
    console.error('API error:', err)
    state.value = 'error'
  }
}

onMounted(checkAPI)
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #eee;
}

.card.ok .badge {
  background: #22c55e;
  color: white;
}

.card.error .badge {
  background: #ef4444;
  color: white;
}

.card.loading .badge {
  background: #f59e0b;
  color: white;
}
</style>