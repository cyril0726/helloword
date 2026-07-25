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

// ⚠️ Pas de try/catch sur load()/send()/reset() — un échec réseau se
// traduit par une erreur silencieuse en console (unhandled rejection),
// sans retour visible à l'utilisateur. Acceptable en l'état pour un
// outil de debug interne à usage personnel, mais à muscler (comme
// DbCard.vue l'a été) si cet outil devient plus qu'un panneau de test.
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
/* Police monospace volontaire ici (contrairement au reste du site en
   sans-serif) — cohérent avec la règle typographique du projet : le
   mono est réservé aux zones techniques ponctuelles (voir
   /docs/Architecture.md), et un panneau "DB TOOL" en est exactement
   un cas d'usage légitime, pas une entorse à la charte. */
.panel {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--space-2);
  font-family: monospace;
  font-size: 12px;
  color: var(--text);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.section-title {
  font-weight: 600;
  opacity: 0.7;
  margin-top: var(--space-2);
}

.row {
  display: flex;
  gap: 4px;
}

input {
  flex: 1;
  padding: 3px 6px;
  font-size: 12px;

  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text);
}

.actions {
  display: flex;
  gap: 4px;
}

button {
  padding: 2px 6px;
  font-size: 11px;

  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text);
  cursor: pointer;
}

button:hover {
  background: var(--border);
}

.danger {
  border-color: var(--danger);
  color: var(--danger);
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