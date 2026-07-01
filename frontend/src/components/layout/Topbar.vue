<template>
  <header class="topbar">
    <div class="left">
      <span>Dashboard</span>
    </div>

    <div class="right">
      <span class="status">● API OK</span>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  margin: 0;
  padding: 0 20px;
  border-bottom: 1px solid #1f1f2a;
  background: #0f0f14;
}

.status {
  color: #4ade80;
  font-size: 12px;
}
</style>