<template>
  <div class="layout">

    <Sidebar />

    <div class="main">
      <Topbar />

      <!-- Reçoit le contenu de page (déjà enveloppé dans sa Transition)
           depuis App.vue — même mécanisme désormais harmonisé avec
           PublicLayout.vue et GameLayout.vue, un seul <RouterView> +
           <Transition> centralisé dans App.vue pour tout le site. -->
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
  padding: var(--space-4);
}
</style>