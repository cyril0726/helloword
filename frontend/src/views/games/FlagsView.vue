<template>
  <FlagsGame />
</template>

<script setup lang="ts">
// Point d'entrée minimal — toute la logique/UI vit dans FlagsGame.vue
// (et son composable useFlags.ts). Layout (GameLayout) et titre/description
// gérés en amont via route.meta, pas ici (voir router/index.ts).
import FlagsGame from '@/components/games/flags/FlagsGame.vue'
</script>