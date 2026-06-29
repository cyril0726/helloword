<template>
  <div class="card">
    <h2>🟢 Database</h2>
    <p>{{ count }} messages</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const count = ref(0)
const API = import.meta.env.VITE_API_URL

onMounted(async () => {
  const res = await fetch(`${API}/api/messages`)
  const data = await res.json()
  count.value = data.length
})
</script>