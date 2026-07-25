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

// Liste maintenue manuellement — pas de lien automatique avec le teaser
// du hero (HeroSection.vue) ni avec les stats affichées dans About.vue
// ("4+ Jeux" y est déjà obsolète, voir commentaire dans ce fichier).
// Convention de nommage : titre/desc affichés en français (contenu),
// route/link toujours en anglais (voir /docs/Architecture.md) — ex:
// "Pendu" affiché, mais /lab/hangman comme route réelle.
const items = [
  {
    icon: "🎮",
    title: "Pendu",
    desc: "Devine le mot avant d'être pendu.",
    // 🐛 CORRIGÉ : pointait vers "/lab/pendu", route inexistante depuis
    // le renommage du jeu (Pendu → Hangman côté fichiers/routes). Le
    // lien était cassé — cliquer sur cette carte ne menait nulle part.
    link: "/lab/hangman",
    tag: "live"
  },
  {
    icon: "🔢",
    title: "Tables",
    desc: "Entraîne-toi aux tables de multiplication.",
    link: "/lab/tables",
    tag: "live"
  },
  {
    icon: "🌍",
    title: "Drapeaux",
    desc: "Reconnais les pays grâce aux drapeaux.",
    link: "/lab/flags",
    tag: "live"
  },
  {
    icon: "⭕❌",
    title: "Morpion",
    desc: "Affronte tes amis.",
    link: "/lab/tictactoe",
    tag: "live"
  },
  {
    icon: "⚡",
    title: "QuickDraw",
    desc: "Sois le plus rapide à réagir au signal, entre potes.",
    link: "/lab/quickdraw",
    tag: "live"
  },
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