<template>
  <div class="grid">
    <LabCard
      v-for="item in items"
      :key="item.title"
      :item="item"
    />
  </div>
</template>

<script setup>
import LabCard from './LabCard.vue'

const items = [
  {
    icon: "🎮",
    title: "Pendu",
    desc: "Devine le mot avant d'être pendu.",
    link: "/lab/pendu",
    tag: "wip"
  },
  {
    icon: "🔢",
    title: "Tables",
    desc: "Entraîne-toi aux tables de multiplication.",
    link: "/lab/tables",
    tag: "wip"
  },
  {
    icon: "🌍",
    title: "Drapeaux",
    desc: "Reconnais les pays grâce aux drapeaux.",
    link: "/lab/drapeaux",
    tag: "wip"
  },
  {
    icon: "⭕❌",
    title: "Morpion",
    desc: "Affronte tes amis.",
    link: "/lab/morpion",
    tag: "wip"
  },
  {
    icon: "🧠",
    title: "Boîte à idée",
    desc: "Concept de futurs jeux",
    link: "/lab/ideas",
    tag: "wip"
  }
]
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-4);
}
</style>