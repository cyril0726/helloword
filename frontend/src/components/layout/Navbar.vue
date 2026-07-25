<template>
  <header class="nav">
    <!-- exact-active-class="" désactive l'ajout automatique de la classe
         active sur ce lien précis — sans ça, le logo prendrait la couleur
         d'accent uniquement sur "/", et redeviendrait neutre ailleurs
         (bug repéré et corrigé tôt dans le projet : la marque doit rester
         visuellement stable sur toutes les pages, pas dépendre de la route). -->
    <RouterLink to="/" class="nav-brand" exact-active-class="">
      CraftGuild
    </RouterLink>

    <div class="nav-right">
      <nav class="nav-links">
        <RouterLink to="/" class="nav-item">Home</RouterLink>
        <RouterLink to="/lab" class="nav-item">Lab</RouterLink>
        <RouterLink to="/about" class="nav-item">About</RouterLink>
      </nav>

      <!-- Zone d'actions à droite — actuellement seul ThemeSwitcher.
           AccountTeaser.vue (icône profil désactivée, prévue pour teaser
           le futur système de compte) avait été conçue à un moment, mais
           volontairement retirée : le compte est en pause côté Roadmap
           (Phase 8 — idée sans finalité confirmée pour l'instant), pas
           de raison d'en teaser l'arrivée tant que ce n'est pas décidé. -->
      <div class="nav-actions">
        <ThemeSwitcher />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
</script>

<style scoped>
.nav {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4);
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.nav-brand {
  text-decoration: none;
  color: var(--accent);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* regroupement logique */
.nav-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.nav-links {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.nav-item {
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color var(--ease);
}

.nav-item:hover {
  color: var(--text);
}

/* Cible la classe ajoutée automatiquement par Vue Router sur le lien
   actif — fonctionne malgré le CSS "scoped" car cette classe est posée
   sur le même élément <a> que RouterLink rend, qui porte déjà l'attribut
   de portée de CE composant (comportement standard de Vue : le CSS scoped
   du parent s'applique à l'élément racine d'un composant enfant). */
.router-link-active {
  color: var(--accent);
}

/* future zone */
.nav-actions {
  display: flex;
  align-items: center;
}
</style>