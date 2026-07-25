<template>
  <aside class="sidebar">

    <div class="sidebar__brand">
      <span>⚙️ CraftGuild</span>
    </div>

    <nav class="sidebar__nav">

      <RouterLink to="/" class="link">
        Home
      </RouterLink>

      <RouterLink to="/dashboard" class="link">
        Dashboard
      </RouterLink>

      <!-- ⚠️ "/projects" ne correspond à aucune route déclarée dans
           router/index.ts — lien mort. Ce composant Sidebar semble être
           du scaffold prévu pour un futur DashboardLayout (voir Roadmap :
           "Admin dashboard : ❌ non implémenté, hors scope actuel"), pas
           encore branché sur de vraies routes. Non corrigé ici (créer la
           route ou retirer le lien est une décision produit, pas un
           nettoyage cosmétique) — à trancher quand le Dashboard sera
           réellement construit. -->
      <RouterLink to="/projects" class="link">
        Projects
      </RouterLink>

      <RouterLink to="/lab" class="link">
        Lab
      </RouterLink>

    </nav>

    <div class="sidebar__footer">
      <span class="status">● Online</span>
    </div>

  </aside>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
/* 🐛 CORRIGÉ : tout ce fichier utilisait des couleurs/espacements codés
   en dur (#aaa, #1a1a1a, white, #2a2a2a, #4ade80, 16px, 24px, 12px...),
   contrairement au reste du projet entièrement variabilisé via tokens.css
   — probablement resté tel quel depuis le tout premier scaffold, jamais
   aligné avec le design system mis en place ensuite. Converti ici aux
   tokens équivalents les plus proches. */
.sidebar {
  width: 240px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--space-3);
  overflow: hidden;
}

.sidebar__brand {
  font-weight: bold;
  margin-bottom: var(--space-4);
  font-size: 16px;
  color: var(--text);
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
}

.link {
  color: var(--text-muted);
  text-decoration: none;
  padding: var(--space-2) var(--space-2);
  border-radius: var(--radius-sm);
  transition: var(--ease);
}

.link:hover {
  background: var(--bg-elevated);
  color: var(--text);
}

.router-link-active {
  background: var(--bg-elevated);
  color: var(--text);
}

.sidebar__footer {
  font-size: 12px;
  opacity: 0.7;
  margin-top: var(--space-4);
  color: var(--text-muted);
}

/* #4ade80 correspondait exactement à var(--status-live) déjà défini
   dans tokens.css — même teinte, maintenant sourcée depuis le token
   plutôt que dupliquée en dur. */
.status {
  color: var(--status-live);
}
</style>