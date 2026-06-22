<template>
  <h1>Hello API</h1>
  <p>{{ message }}</p>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const message = ref('Chargement...')

onMounted(async () => {
  const res = await fetch('/api/hello')
  const data = await res.json()
  message.value = data.message
})
</script>