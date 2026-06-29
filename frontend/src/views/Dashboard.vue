<template>
  <div class="container">
    <h1>🧭 System Dashboard 🧭</h1>

    <div class="grid">
      <ApiStatus />
      <DbStatus />
      <WriteTest />
      <SystemInfo />
    </div>
  </div>
</template>

<script setup lang="ts">
import ApiStatus from '../components/ApiStatus.vue'
import DbStatus from '../components/DbStatus.vue'
import WriteTest from '../components/WriteTest.vue'
import SystemInfo from '../components/SystemInfo.vue'
</script>

<style>
.container {
  max-width: 800px;
  margin: auto;
  font-family: sans-serif;
}

.grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>