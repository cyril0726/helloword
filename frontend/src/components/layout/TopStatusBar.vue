<template>
  <div class="bar">
    <div class="left">
      <h2>🧭 System Dashboard</h2>
      <span class="global" :class="globalStatus">
        {{ globalLabel }}
      </span>
      <span v-if="latency" class="latency">{{ latency }}ms</span>
    </div>

    <div class="right">
      <label class="refresh-toggle">
        <input type="checkbox" v-model="autoRefresh" />
        Auto
      </label>
      <select
        v-model.number="refreshInterval"
        class="refresh-select"
        :disabled="!autoRefresh"
      >
        <option :value="5">5s</option>
        <option :value="10">10s</option>
        <option :value="30">30s</option>
        <option :value="60">60s</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

const API = import.meta.env.VITE_API_URL;

const globalStatus = ref("loading");
const globalLabel = ref("Checking...");
const latency = ref(0);

const autoRefresh = ref(false);
const refreshInterval = ref(10); // secondes

let intervalId: ReturnType<typeof setInterval> | null = null;

async function check() {
  const start = performance.now();

  try {
    const res = await fetch(`${API}/api/health`);
    const data = await res.json();

    // api/db restent des variables locales (pas des refs) : elles ne
    // pilotent que la logique ci-dessous, rien n'a besoin de les
    // afficher ni de les rendre réactives individuellement.
    const apiOk = (data.api ?? "ok") === "ok";
    const dbOk = (data.db ?? "ok") === "ok";

    latency.value = Math.round(performance.now() - start);

    if (apiOk && dbOk) {
      globalStatus.value = "ok";
      globalLabel.value = "All systems operational";
    } else {
      globalStatus.value = "error";
      globalLabel.value = "Degraded performance";
    }
  } catch {
    // Ne se déclenche qu'en cas d'échec réseau total (pas de réponse
    // HTTP du tout) — un 500 avec un corps JSON valide (voir backend
    // /api/health, qui renvoie toujours du JSON même en erreur DB) est
    // géré normalement ci-dessus, pas ici.
    globalStatus.value = "error";
    globalLabel.value = "System offline";
    latency.value = 0;
  }
}

function startAutoRefresh() {
  stopAutoRefresh();
  intervalId = setInterval(check, refreshInterval.value * 1000);
}

function stopAutoRefresh() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// Démarre/arrête le polling selon la case cochée
watch(autoRefresh, (enabled) => {
  if (enabled) startAutoRefresh();
  else stopAutoRefresh();
});

// Si l'intervalle change pendant que l'auto-refresh est actif,
// redémarre immédiatement avec la nouvelle valeur (pas d'attente
// jusqu'à la prochaine échéance de l'ancien intervalle).
watch(refreshInterval, () => {
  if (autoRefresh.value) startAutoRefresh();
});

onMounted(check);
onBeforeUnmount(stopAutoRefresh);
</script>

<style scoped>
.bar {
  padding: var(--space-2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  max-width: 900px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

h2 {
  font-size: 14px;
  margin: 0;
  color: var(--text);
}

/* Harmonisé avec le style des badges de LabCard.vue (fond + bordure +
   couleur, pas juste une couleur de texte comme avant) — même famille
   visuelle utilisée partout ailleurs sur le site pour un statut. */
.global {
  font-size: 11px;
  padding: 2px var(--space-2);
  border-radius: 999px;
  border: 1px solid;
}

.ok {
  color: var(--status-live);
  border-color: var(--status-live);
  background: var(--status-live-bg);
}

.error {
  color: var(--danger);
  border-color: var(--danger);
  background: var(--danger-bg);
}

/* --status-wip (ambré) réutilisé pour "loading" faute de token dédié
   "warning" — sémantiquement proche, à séparer si ce composant grossit. */
.loading {
  color: var(--status-wip);
  border-color: var(--status-wip);
  background: var(--status-wip-bg);
}

.latency {
  font-size: 11px;
  color: var(--text-faint);
}

.right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.refresh-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-muted);
  cursor: pointer;
}

.refresh-select {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text);
}

.refresh-select:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>