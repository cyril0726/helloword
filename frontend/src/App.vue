/*👉 rôle :
-> affiche la page active*/
<template>
  <component :is="layout">
    <router-view />
    
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import PublicLayout from '@/layouts/PublicLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const route = useRoute()

const layout = computed(() => {
  return route.meta.layout === 'dashboard'
    ? DashboardLayout
    : PublicLayout
})
</script>