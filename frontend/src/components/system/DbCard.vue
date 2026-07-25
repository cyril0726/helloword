<template>
  <div class="card">
    <h3>🟨 Database</h3>

    <div class="row">
      <span>Status</span>
      <span :class="status">{{ statusLabel }}</span>
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

// 🐛 CORRIGÉ : le statut était codé en dur ("Connected" toujours affiché
// en vert), sans aucune vérification réelle — si /api/messages échouait,
// rien ne le signalait, le badge mentait sur l'état réel de la DB.
const status = ref<"ok" | "error" | "idle">("idle");
const statusLabel = ref("Idle");

async function load() {
  status.value = "idle";
  statusLabel.value = "Loading...";

  try {
    const res = await fetch(`${API}/api/messages`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    count.value = data.length;

    status.value = "ok";
    statusLabel.value = "Connected";
  } catch {
    status.value = "error";
    statusLabel.value = "Unreachable";
  }
}

load();
</script>

<style scoped>
/* 🐛 CORRIGÉ : ".card" n'avait AUCUN style dans ce fichier — le composant
   s'affichait sans fond, sans bordure, sans padding, contrairement à
   ApiCard.vue (même dossier) qui a le style complet. Repris ici à
   l'identique pour la cohérence visuelle entre les deux cartes. */
.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-2);

  color: var(--text);

  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.row {
  display: flex;
  justify-content: space-between;
}

.ok { color: var(--status-live); }
.error { color: var(--danger); }
.idle { color: var(--text-muted); }

button {
  padding: 6px var(--space-2);
  border-radius: var(--radius-sm);
  border: none;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
  font-size: 12px;
}
</style>