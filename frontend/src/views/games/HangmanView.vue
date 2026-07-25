<template>
  <HangmanGame />
</template>

<script setup lang="ts">
// Point d'entrée minimal — toute la logique/UI vit dans Hangman.vue
// (et son composable useHangman.ts). Layout (GameLayout) et titre/description
// gérés en amont via route.meta, pas ici (voir router/index.ts).
import HangmanGame from '@/components/games/hangman/HangmanGame.vue'
</script>