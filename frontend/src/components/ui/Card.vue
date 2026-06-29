<template>
  <div class="card">
    <slot />
  </div>
</template>

<style scoped>
.card {
  background: #0f172a;
  border: 1px solid #1f2937;
  border-radius: 10px;
  padding: 10px;

  color: #e5e7eb;

  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card:hover {
  transform: translateY(-2px);
  border-color: #374151;
  box-shadow: 0 6px 20px rgba(0,0,0,0.35);
}
</style>