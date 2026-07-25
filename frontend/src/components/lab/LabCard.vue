<template>
  <!-- Rendu conditionnel : RouterLink si cliquable, simple <div> sinon.
       Décision prise après un bug initial où toutes les cartes étaient
       des RouterLink, y compris les jeux non terminés (wip) — cliquer
       dessus menait vers une page vide. Une carte non cliquable (locked)
       ne doit pas non plus avoir le curseur "pointer" ni l'effet hover,
       d'où is-hoverable conditionné à isClickable ci-dessous. -->
  <component
    :is="isClickable ? RouterLink : 'div'"
    :to="isClickable ? item.link : undefined"
    class="card lab-card"
    :class="{ 'is-hoverable': isClickable, 'lab-card--disabled': !isClickable }"
  >
    <span v-if="item?.tag" class="badge" :class="badgeClass">
      {{ tagLabel }}
    </span>

    <span class="lab-card__icon">{{ item?.icon }}</span>

    <div class="lab-card__content">
      <h3 class="lab-card__title">{{ item?.title }}</h3>
      <p class="lab-card__desc">{{ item?.desc }}</p>
    </div>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  item: Object
})

// Machine à 3 états pour chaque jeu du Lab :
//   locked → idée pas encore commencée, pas de route, non cliquable
//   wip    → route existe, cliquable, contenu potentiellement incomplet
//   live   → jeu complet et jouable
// Seul "locked" rend la carte non cliquable ; "wip" reste accessible
// volontairement (permet de tester/montrer un jeu en cours de dev).
const isClickable = computed(() => props.item?.tag !== 'locked')

const badgeClass = computed(() => {
  const map = {
    live: 'badge--live',
    wip: 'badge--wip',
    locked: 'badge--locked'
  }
  return map[props.item?.tag] || 'badge--wip'
})

// Label affiché séparé de la donnée brute (item.tag) — évite d'afficher
// littéralement "wip" ou "locked" à l'utilisateur, qui verrait un mot
// technique plutôt qu'un texte compréhensible.
const tagLabel = computed(() => {
  const map = {
    live: 'live',
    wip: 'en travaux',
    locked: 'bientôt'
  }
  return map[props.item?.tag] || 'en travaux'
})
</script>

<style scoped>
.lab-card {
  display: block;
  text-decoration: none;
  color: inherit;
}

.lab-card--disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.lab-card__icon {
  font-size: 20px;
  display: block;
}

.lab-card__title {
  margin: var(--space-2) 0 4px;
  font-size: 15px;
  color: var(--text);
}

.lab-card__desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}

.badge {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid;
}

/* Les 3 couleurs de badge sont volontairement INDÉPENDANTES du thème
   d'accent ([data-theme] géré par ThemeSwitcher.vue) — le statut d'un
   jeu (en travaux / live / bientôt) est une information fonctionnelle,
   elle ne doit pas changer visuellement selon l'esthétique choisie par
   le visiteur. Seule .lab-card.is-hoverable:hover ci-dessous suit le
   thème (var(--accent)), car c'est une interaction, pas un statut. */
.badge--wip {
  background: var(--status-wip-bg);
  border-color: var(--status-wip);
  color: var(--status-wip);
}

.badge--live {
  background: var(--status-live-bg);
  border-color: var(--status-live);
  color: var(--status-live);
}

.badge--locked {
  background: var(--status-locked-bg);
  border-color: var(--status-locked);
  color: var(--status-locked);
}

.lab-card.is-hoverable:hover {
  border-color: var(--accent);
}

.lab-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>