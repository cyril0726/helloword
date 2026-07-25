<template>
  <AboutSection />
</template>

<script setup lang="ts">
// Point d'entrée minimal — toute la logique/UI vit dans AboutSection.vue.
// Layout (GameLayout) et titre/description
// gérés en amont via route.meta, pas ici (voir router/index.ts).
import AboutSection from '@/components/about/AboutSection.vue'
</script>