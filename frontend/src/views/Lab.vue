<template>
  <section class="page">
    <h2 class="lab-heading">Explorer le laboratoire</h2>

    <p class="lab-intro">
      Tous les projets interactifs. Jeux, outils et prototypes expérimentaux.
    </p>

    <ExplorerGrid />
  </section>
</template>

<script setup lang="ts">
import ExplorerGrid from '@/components/lab/ExplorerGrid.vue'
</script>

<style scoped>
/* Cohérent avec la typographie déjà établie ailleurs (About.vue,
   HeroSection.vue) : couleurs/tailles via tokens, pas de valeurs brutes. */
.lab-heading {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0 0 var(--space-2);
}

.lab-intro {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-muted);
  max-width: 480px;
  margin: 0;
}
</style>