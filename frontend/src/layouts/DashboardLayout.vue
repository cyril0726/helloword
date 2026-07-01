<template>
  <div class="layout">

    <Sidebar />

    <div class="main">
      <Topbar />

      <main class="content">
        <slot />
      </main>
    </div>

  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/layout/Sidebar.vue'
import Topbar from '@/components/layout/Topbar.vue'
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;

  min-height: 0;
}

.content {
  flex: 1;
  overflow: auto;

  min-height: 0;
  padding: 24px;
}
</style>