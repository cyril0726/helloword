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
    desc: "Devine le mot avant d’être pendu.",
    link: "/lab/pendu",
    tag: "en travaux"
  },
  {
    icon: "🔢",
    title: "Tables",
    desc: "Entraîne-toi aux tables de multiplication.",
    link: "/lab/tables",
    tag: "en travaux"
  },
  {
    icon: "🌍",
    title: "Drapeaux",
    desc: "Reconnais les pays grâce aux drapeaux.",
    link: "/lab/drapeaux",
    tag: "en travaux"
  },
  {
    icon: "⭕❌",
    title: "Morpion",
    desc: "Affronte tes amis.",
    link: "/lab/morpion",
    tag: "en travaux"
  },
  {
    icon: "🧠",
    title: "Boîte à idée",
    desc: "Concept de futurs jeux",
    link: "/lab/ideas",
    tag: "en travaux"
  }
]
</script>

<style>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 20px;
}
</style>