<template>
  <TicTacToeGame />
</template>

<script setup lang="ts">
// Point d'entrée minimal — toute la logique/UI vit dans Tictactoe.vue
// (et son composable useTictactoe.ts). Layout (GameLayout) et titre/description
// gérés en amont via route.meta, pas ici (voir router/index.ts).
import TicTacToeGame from '@/components/games/tictactoe/TicTacToeGame.vue'
</script>