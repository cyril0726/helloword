<template>
  <h1>API Test :</h1>

  <p v-if="loading">loading...</p>
  <p v-else>{{ message }}</p>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const message = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('http://127.0.0.1:8787/api/hello')
    const data = await res.json()

    message.value = data.message
  } catch (err) {
    message.value = 'Erreur API'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>