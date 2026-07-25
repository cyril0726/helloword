<template>
  <TablesGame />
</template>

<script setup lang="ts">
// Point d'entrée minimal — toute la logique/UI vit dans Tables.vue
// (et son composable useTables.ts). Layout (GameLayout) et titre/description
// gérés en amont via route.meta, pas ici (voir router/index.ts).
import TablesGame from '@/components/games/tables/TablesGame.vue'
</script>