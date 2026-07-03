<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import PublicLayout from '@/layouts/PublicLayout.vue'
import GameLayout from '@/layouts/GameLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const route = useRoute()

const layout = computed(() => {
  if (route.meta.layout === 'dashboard') return DashboardLayout
  if (route.meta.layout === 'game') return GameLayout
  return PublicLayout
})
</script>