<template>
  <div class="bar">
    <div class="left">
      <h2>🧭 System Dashboard</h2>
      <span class="global" :class="globalStatus">
        {{ globalLabel }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const API = import.meta.env.VITE_API_URL;

const api = ref("loading");
const db = ref("loading");
const latency = ref(0);

const globalStatus = ref("loading");

const globalLabel = ref("Checking...");

async function check() {
  const start = performance.now();

  try {
    const res = await fetch(`${API}/api/health`);
    const data = await res.json();

    api.value = data.api ?? "ok";
    db.value = data.db ?? "ok";

    latency.value = Math.round(performance.now() - start);

    if (api.value === "ok" && db.value === "ok") {
      globalStatus.value = "ok";
      globalLabel.value = "All systems operational";
    } else {
      globalStatus.value = "error";
      globalLabel.value = "Degraded performance";
    }
  } catch {
    api.value = "error";
    db.value = "error";

    globalStatus.value = "error";
    globalLabel.value = "System offline";
  }
}

onMounted(check);
</script>

<style scoped>
.bar {
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 900px;
  background: #0f172a;
  border: 1px solid #1f2937;
  border-radius: 6px;
}


h2 {
  font-size: 14px;
  margin: 0;
}

.global {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
}

.item {
  display: flex;
  gap: 6px;
}

.ok {
  color: #22c55e;
}

.error {
  color: #ef4444;
}

.loading {
  color: #f59e0b;
}
</style>