<template>
  <div class="panel">
    <div class="section-title">DB TOOL</div>

    <!-- INPUT ROW -->
    <div class="row">
      <input
        v-model="text"
        placeholder="write message..."
        @keyup.enter="send"
      />


    </div>

    <!-- ACTIONS -->
    <div class="actions">
      <button @click="send" :disabled="!text || loading">
        send
      </button>
      <button class="danger" @click="reset">clear db</button>
    </div>

    <!-- STATUS -->
    <div class="meta">
      messages: {{ messages.length }}
    </div>

    <!-- LIST -->
    <div class="logs">
      <div v-for="m in messages" :key="m.id">
        #{{ m.id }} {{ m.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const API = import.meta.env.VITE_API_URL;

const text = ref("");
const messages = ref<any[]>([]);
const loading = ref(false);

async function load() {
  const res = await fetch(`${API}/api/messages`);
  messages.value = await res.json();
}

async function send() {
  if (!text.value) return;

  loading.value = true;

  try {
    await fetch(`${API}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.value })
    });

    text.value = "";
    await load();
  } finally {
    loading.value = false;
  }
}

async function reset() {
  const ok = confirm("clear all messages ?");
  if (!ok) return;

  await fetch(`${API}/api/messages`, {
    method: "DELETE"
  });

  await load();
}

onMounted(load);
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  font-family: monospace;
  font-size: 12px;
  color: #e5e7eb;
  background: #0f172a;
  border: 1px solid #1f2937;
  border-radius: 6px;
}

.title {
  opacity: 0.7;
}

.section-title {
  font-weight: 600;
  opacity: 0.7;
  margin-top: 6px;
}

.row {
  display: flex;
  gap: 4px;
}

input {
  flex: 1;
  padding: 3px 6px;
  font-size: 12px;

  background: #0b1220;
  border: 1px solid #1f2937;
  color: white;
}

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
}

button:hover {
  background: #1f2937;
}

.danger {
  border-color: #7f1d1d;
  color: #fca5a5;
}

.meta {
  opacity: 0.6;
  font-size: 11px;
}

.logs {
  display: flex;
  flex-direction: column;
  gap: 0px;
  line-height: 1.2;
}
</style>