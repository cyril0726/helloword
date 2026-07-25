<template>
  <div class="public-layout">
    <Navbar />

    <!-- Reçoit le contenu de page (déjà enveloppé dans sa Transition)
         depuis App.vue, comme GameLayout.vue et DashboardLayout.vue —
         un seul mécanisme de routage/transition pour tout le site,
         plus de <RouterView> ni de <Transition> dupliqués ici. -->
    <main class="content">
      <slot />
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
</script>

<style scoped>
.public-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>