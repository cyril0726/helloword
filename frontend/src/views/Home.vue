<template>
  <HeroSection />
</template>

<script setup lang="ts">
// Point d'entrée minimal — toute la logique/UI vit dans HeroSection.vue
// Layout (PublicLayout) et titre/description
// gérés en amont via route.meta, pas ici (voir router/index.ts).
import HeroSection from '@/components/hero/HeroSection.vue'
</script>