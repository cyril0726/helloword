<template>
  <div class="card">
    <h2>⚙️ System</h2>
    <p>API: {{ api }}</p>
  </div>
</template>

<script setup lang="ts">
const api = import.meta.env.VITE_API_URL
</script>