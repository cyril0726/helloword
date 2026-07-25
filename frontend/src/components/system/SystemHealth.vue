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

// ⚠️ DUPLICATION : ce composant réimplémente quasi à l'identique la
// logique de fetch/try-catch déjà présente dans ApiCard.vue, DbCard.vue
// et TopStatusBar.vue (même dossier /components/system) — 4ème copie du
// même pattern "fetch /api/health, gérer ok/error/loading". Candidat
// naturel pour un composable partagé (ex: useApiHealth()), sur le même
// principe que les composables de jeux (useHangman, useFlags...). Non
// factorisé pour l'instant — changement structurel plus large que le
// nettoyage fichier par fichier en cours.
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
/* 🐛 CORRIGÉ : ".card" n'avait AUCUN style ici, même bug que sur
   DbCard.vue avant correction — repris à l'identique du style commun
   utilisé par ApiCard.vue / DbCard.vue pour la cohérence visuelle. */
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

/* 🐛 CORRIGÉ : manquait — api/db peuvent valoir "loading" (état initial
   avant la réponse du fetch), mais aucune règle ne stylait cette classe,
   contrairement à TopStatusBar.vue qui l'a déjà. */
.loading { color: var(--status-wip); }
</style>