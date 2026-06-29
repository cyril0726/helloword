<template>
  <div class="card">
    <h3>🧭 System Health</h3>

    <div class="row">
      <span>API</span>
      <span :class="api">{{ api }}</span>
    </div>

    <div class="row">
      <span>Database</span>
      <span :class="db">{{ db }}</span>
    </div>

    <div class="row">
      <span>Latency</span>
      <span>{{ latency }}ms</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const API = import.meta.env.VITE_API_URL;

const api = ref("loading");
const db = ref("loading");
const latency = ref(0);

async function check() {
  const start = performance.now();

  try {
    const res = await fetch(`${API}/api/health`);
    const data = await res.json();

    api.value = data.api ?? "ok";
    db.value = data.db ?? "ok";

    latency.value = Math.round(performance.now() - start);
  } catch {
    api.value = "error";
    db.value = "error";
  }
}

onMounted(check);
</script>

<style scoped>
.row {
  display: flex;
  justify-content: space-between;
}

.ok { color: #22c55e; }
.error { color: #ef4444; }
</style>