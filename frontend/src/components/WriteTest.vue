<template>
  <div class="card">
    <h2>✍️ Write test</h2>

    <button @click="testWrite">Send test</button>

    <p v-if="result">{{ result }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const result = ref('')
const API = import.meta.env.VITE_API_URL

async function testWrite() {
  const res = await fetch(`${API}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'test dashboard' })
  })

  const data = await res.json()
  result.value = JSON.stringify(data)
}
</script>