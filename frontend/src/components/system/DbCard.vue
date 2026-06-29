<template>
  <div class="card">
    <h3>🟨 Database</h3>

    <div class="row">
      <span>Status</span>
      <span class="ok">Connected</span>
    </div>

    <div class="row">
      <span>Messages</span>
      <span>{{ count }}</span>
    </div>

    <button @click="load">Refresh</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const API = import.meta.env.VITE_API_URL;
const count = ref(0);

async function load() {
  const res = await fetch(`${API}/api/messages`);
  const data = await res.json();
  count.value = data.length;
}

load();
</script>

<style scoped>
.row {
  display: flex;
  justify-content: space-between;
}

.ok { color: #22c55e; }

button {
  padding: 6px 8px;
  border-radius: 6px;
  border: none;
  background: #1d4ed8;
  color: white;
  cursor: pointer;
  font-size: 12px;
}
</style>