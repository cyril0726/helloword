<template>
  <!-- 🐛 CORRIGÉ : renommé "page" → "dashboard-page" pour éviter la
       collision avec .page de global.css (même nom, mais rôles opposés :
       le .page global impose max-width:1100px + padding 64px pensés pour
       les pages publiques, propriétés que ce fichier ne redéfinissait
       pas et qui continuaient donc de s'appliquer ici malgré le style
       scopé — la spécificité de Vue Scoped joue par PROPRIÉTÉ, pas par
       règle entière). -->
  <div class="dashboard-page">
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

// ⚠️ Si le fetch /api/health réussit (api/db correctement renseignés)
// mais que le fetch /api/messages juste après échoue (coupure réseau
// entre-temps), le catch global ci-dessous repasse api ET db à "error"
// — écrasant un diagnostic déjà correct obtenu un instant plus tôt. Les
// deux fetches ne sont pas isolés l'un de l'autre pour la gestion
// d'erreur. Non corrigé pour l'instant (nécessiterait deux try/catch
// séparés, changement de logique plutôt que nettoyage cosmétique).
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
.dashboard-page {
  width: 100%;
  height: 100%;
  display: block;

  background: var(--bg);
  color: var(--text);
  font-family: monospace;
}

/* MAIN WRAPPER */
.container {
  width: 100%;
  max-width: 900px;
  /* 🐛 CORRIGÉ : margin: auto manquant — max-width seul ne centre rien,
     le contenu restait collé à gauche plutôt que centré. */
  margin: 0 auto;
}

/* PANEL CARD */
.panel {
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

/* STATUS LINE */
.line {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-size: 12px;
  opacity: 0.95;
}

.label {
  color: var(--text-muted);
}

/* STATUS BADGES */
.status {
  font-weight: bold;
}

.ok {
  color: var(--status-live);
}

.error {
  color: var(--danger);
}

.loading {
  color: var(--status-wip);
}

/* ACTIONS */
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
  border-radius: var(--radius-sm);
}

button:hover {
  background: var(--border);
}
</style>