<template>
  <h1>API Test :</h1>

  <p v-if="loading">loading...</p>
  <p v-else>{{ message }}</p>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const message = ref('')
const loading = ref(true)

// Local = proxy Vite
// Prod = Cloudflare Worker
const API =
  import.meta.env.MODE === 'development'
    ? ''
    : 'https://helloword-api.cyrilgourdon-cg.workers.dev'

onMounted(async () => {
  try {
    const res = await fetch(`${API}/api/hello`)

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`)
    }

    const data = await res.json()
    message.value = data.message

  } catch (err) {
    console.error(err)
    message.value = 'Erreur API'
  } finally {
    loading.value = false
  }
})
</script>