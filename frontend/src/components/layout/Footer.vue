<template>
  <footer class="footer">
    <span>© {{ year }} GridCraft</span>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  padding: 8px;
  text-align: center;
  font-size: 11px;
  color: #666;
}
</style>