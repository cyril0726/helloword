<template>
  <header class="topbar">
    <div class="left">
      <!-- Statique pour l'instant — "Dashboard" toujours affiché quel
           que soit le contenu réel de la page. À rendre dynamique
           (ex: via route.meta.title, même pattern que GameLayout.vue)
           une fois le Dashboard réellement construit avec plusieurs
           sous-sections. -->
      <span>Dashboard</span>
    </div>

    <div class="right">
      <!-- ⚠️ Statique et toujours "OK" — pas connecté à /api/health
           (voir backend/src/index.ts). Actuellement trompeur si ce
           composant était affiché en conditions réelles : afficherait
           "API OK" même si l'API est down. Sans impact tant que le
           Dashboard n'est pas branché (scaffold non utilisé), mais à
           corriger avant toute mise en service réelle — fetch vers
           /api/health et affichage conditionnel selon la réponse. -->
      <span class="status">● API OK</span>
    </div>
  </header>
</template>

<style scoped>
/* 🐛 CORRIGÉ : mêmes valeurs codées en dur que Sidebar.vue (scaffold du
   Dashboard jamais aligné avec tokens.css) — converties ici de la même
   façon. */
.topbar {
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  margin: 0;
  padding: 0 var(--space-4);
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.status {
  color: var(--status-live);
  font-size: 12px;
}
</style>