<template>
  <div class="page">
    <div class="container">

      <TopStatusBar />

      <div class="panel">

        <!-- STATUS LINE -->
        <div class="line">
          <span class="label">API:</span>
          <span :class="['status', api]">{{ api }}</span>

          <span class="label">DB:</span>
          <span :class="['status', db]">{{ db }}</span>

          <span class="label">LAT:</span>
          <span class="status">{{ latency }}ms</span>
        </div>

        <!-- ACTIONS -->
        <div class="actions">
          <button @click="refreshAll">refresh</button>
        </div>

        <!-- PLAYGROUND -->
        <DbPlayground />

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import TopStatusBar from "../components/layout/TopStatusBar.vue";
import DbPlayground from "../components/tools/DbPlayground.vue";

const API = import.meta.env.VITE_API_URL;

const api = ref<"loading" | "ok" | "error">("loading");
const db = ref<"loading" | "ok" | "error">("loading");
const latency = ref(0);

async function refreshAll() {
  const start = performance.now();

  try {
    const healthRes = await fetch(`${API}/api/health`);
    const health = await healthRes.json();

    api.value = health.api ?? "ok";
    db.value = health.db ?? "ok";

    await fetch(`${API}/api/messages`);

    latency.value = Math.round(performance.now() - start);
  } catch (e) {
    api.value = "error";
    db.value = "error";
  }
}

onMounted(refreshAll);
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 8px;
  box-sizing: border-box;
  background: #0a0a0a;
  color: #e5e7eb;
  font-family: monospace;
}

/* MAIN WRAPPER */
.container {
  width: 100%;
  max-width: 900px;
}

/* PANEL CARD */
.panel {
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  background: #0f172a;
  border: 1px solid #1f2937;
  border-radius: 6px;
}

/* STATUS LINE */
.line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  opacity: 0.95;
}

.label {
  color: #9ca3af;
}

/* STATUS BADGES */
.status {
  font-weight: bold;
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

/* ACTIONS */
.actions {
  display: flex;
  gap: 4px;
}

button {
  padding: 2px 6px;
  font-size: 11px;
  background: #111827;
  border: 1px solid #1f2937;
  color: #e5e7eb;
  cursor: pointer;
  border-radius: 4px;
}

button:hover {
  background: #1f2937;
}
</style>