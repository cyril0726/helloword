<template>
  <div class="public-layout">
    <Navbar />

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

<style>
.public-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
}
</style>