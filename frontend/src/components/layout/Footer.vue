<template>
  <footer class="footer">
    <span>© {{ year }} CraftGuild</span>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  padding: var(--space-2);
  text-align: center;
  font-size: 11px;
  color: var(--text-faint);
}
</style>