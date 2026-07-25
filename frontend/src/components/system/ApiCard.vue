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

    // 🐛 CORRIGÉ : deux bugs liés.
    // 1. `data.message` n'existe pas sur /api/health (ce champ n'existe
    //    que sur la route racine "/") — le fallback "API OK" s'affichait
    //    donc systématiquement, jamais de vraie donnée dynamique.
    // 2. status passait à "ok" sans vérifier data.db — si la DB était en
    //    panne (backend renvoie alors un 500, mais fetch() ne throw pas
    //    sur un statut HTTP non-2xx, seulement sur un échec réseau total),
    //    ce composant affichait quand même "ok" en vert. Incohérent avec
    //    TopStatusBar.vue, qui vérifie bien api ET db.
    const dbOk = data.db === "ok";

    status.value = dbOk ? "ok" : "error";
    message.value = dbOk
      ? `DB ok · ${data.latencyMs}ms`
      : `DB en erreur · ${data.latencyMs}ms`;
  } catch {
    status.value = "error";
    message.value = "API unreachable";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* 🐛 CORRIGÉ : couleurs codées en dur, converties aux tokens (même
   famille de correction que Sidebar.vue / Topbar.vue / TopStatusBar.vue). */
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