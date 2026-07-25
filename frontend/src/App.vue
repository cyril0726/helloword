<template>
  <!-- RouterView + Transition centralisés ICI, une seule fois — chaque
       layout (Public/Game/Dashboard) reçoit ce contenu déjà "prêt" via
       son <slot />, au lieu de dupliquer chacun sa propre logique de
       routage/transition. Avant cette harmonisation, PublicLayout avait
       son propre <RouterView>+<Transition> interne, tandis que
       GameLayout/DashboardLayout utilisaient <slot /> sans transition du
       tout — deux mécanismes différents pour le même besoin. Effet de
       bord de cette centralisation : Game et Dashboard héritent
       désormais aussi de la transition "page" (fondu entre routes),
       qu'ils n'avaient pas avant. -->
  <component :is="layout">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { RouterView } from 'vue-router'

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