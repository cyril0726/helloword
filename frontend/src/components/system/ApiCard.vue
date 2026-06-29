<template>
  <div class="card">
    <h3>🟦 API</h3>

    <div class="row">
      <span>Status</span>
      <span :class="status">{{ status }}</span>
    </div>

    <p v-if="message">{{ message }}</p>

    <button @click="test">
      {{ loading ? "Testing..." : "Test API" }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const API = import.meta.env.VITE_API_URL;

const status = ref<"ok" | "error" | "idle">("idle");
const message = ref("");
const loading = ref(false);

async function test() {
  loading.value = true;
  status.value = "idle";
  message.value = "";

  try {
    const res = await fetch(`${API}/api/health`);
    const data = await res.json();

    status.value = "ok";
    message.value = data.message ?? "API OK";
  } catch {
    status.value = "error";
    message.value = "API unreachable";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.card {
  background: #0f172a;
  border: 1px solid #1f2937;
  border-radius: 10px;
  padding: 10px;

  color: #e5e7eb;

  display: flex;
  flex-direction: column;
  gap: 6px;
}

.row {
  display: flex;
  justify-content: space-between;
}

.ok { color: #22c55e; }
.error { color: #ef4444; }

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