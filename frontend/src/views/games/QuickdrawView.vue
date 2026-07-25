<template>
  <QuickdrawGame />
</template>

<script setup lang="ts">
// Point d'entrée minimal — toute la logique/UI vit dans Quickdraw.vue
// (et son composable useQuickdraw.ts). Layout (GameLayout) et titre/description
// gérés en amont via route.meta, pas ici (voir router/index.ts).
import QuickdrawGame from '@/components/games/quickdraw/QuickdrawGame.vue'
</script>