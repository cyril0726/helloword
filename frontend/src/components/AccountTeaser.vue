<!-- components/AccountTeaser.vue -->
<template>
<div class="account-teaser" title="Comptes bientôt disponibles">
    <svg viewBox="0 0 24 24" class="account-icon" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.account-teaser {
  position: relative; /* ← cette ligne doit être là */
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--text-faint);
  cursor: not-allowed;
  opacity: 0.6;
}

.account-icon {
  width: 15px;
  height: 15px;
}
</style>