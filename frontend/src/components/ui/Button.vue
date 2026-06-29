<template>
  <button class="btn" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  disabled?: boolean
}>()
</script>

<style scoped>
.btn {
  padding: 8px 12px;
  border-radius: 10px;

  background: #2563eb;
  color: white;

  border: 1px solid transparent;

  cursor: pointer;

  font-size: 14px;
  font-weight: 500;

  transition: all 0.15s ease;
}

.btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>