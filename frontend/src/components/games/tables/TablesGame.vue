<template>
  <div class="tables-game">
    <!-- MENU : sélection des tables à réviser + choix du mode -->
    <div v-if="screen === 'menu'" class="tables-screen">
      <h2 class="tables-heading">Quelles tables veux-tu tester ?</h2>

      <div class="tables-grid">
        <button
          v-for="n in 9"
          :key="n"
          class="table-btn"
          :class="{ 'table-btn--selected': tables.includes(n) }"
          @click="toggleTable(n)"
        >
          {{ n }}
        </button>
      </div>

      <!-- Deux modes distincts, gérés entièrement par le composable :
           chrono = 60s, le plus de bonnes réponses possible ;
           zen = nombre de questions fixe (maxQuestions), sans pression -->
      <div class="mode-buttons">
        <button
          class="btn btn--primary"
          :disabled="!canStart"
          @click="startGame('chrono')"
        >
          Challenge ⏱️
        </button>
        <button
          class="btn btn--primary"
          :disabled="!canStart"
          @click="startGame('zen')"
        >
          Entraînement 🧘
        </button>
      </div>

      <Transition name="toast">
        <p v-if="message" class="tables-toast">{{ message }}</p>
      </Transition>
    </div>

    <!-- GAME : question en cours + HUD adapté au mode -->
    <div v-else-if="screen === 'game'" class="tables-screen">
      <div class="tables-hud">
        <div class="hud-item">Score : {{ score }}</div>
        <div class="hud-item">Erreurs : {{ errors }}</div>
        <!-- HUD différent selon le mode : progression (zen) vs
             compte à rebours (chrono) — jamais les deux en même temps -->
        <div v-if="mode === 'zen'" class="hud-item">
          {{ questionsAsked }}/{{ maxQuestions }}
        </div>
        <div v-else class="hud-item hud-item--timer">⏱ {{ time }}</div>
      </div>

      <p class="tables-chosen">
        Tables sélectionnées : {{ tables.join(', ') }}
      </p>

      <p class="tables-question">
        {{ current?.t }} × {{ current?.m }}
      </p>

      <form class="tables-form" @submit.prevent="submitAnswer">
        <input
          ref="inputRef"
          v-model="answer"
          type="text"
          inputmode="numeric"
          class="tables-input"
          placeholder="Réponse"
          autocomplete="off"
        />
        <button type="submit" class="btn btn--primary">Valider</button>
      </form>

      <Transition name="toast">
        <p v-if="message" class="tables-toast">{{ message }}</p>
      </Transition>
    </div>

    <!-- END : récapitulatif, contenu variable selon le mode joué -->
    <div v-else class="tables-screen">
      <h2 class="tables-heading">Partie terminée</h2>

      <div class="tables-result">
        <!-- Le score n'a pas la même forme selon le mode : "X/questions"
             en zen (dénominateur fixe connu), "X" seul en chrono (le
             nombre de questions posées varie selon la vitesse du joueur) -->
        <p v-if="mode === 'zen'">⭐ Score : {{ score }} / {{ questionsAsked }}</p>
        <p v-else>⭐ Score : {{ score }}</p>

        <p v-if="mode === 'zen'">❌ Erreurs : {{ errors }}</p>
        <p v-if="accuracy !== null">🎯 Précision : {{ accuracy }}%</p>
        <p>🔥 Meilleure série : {{ bestStreak }}</p>

        <p class="tables-rank">{{ rank }}</p>
      </div>

      <button class="btn btn--primary" @click="restart">Rejouer</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useTables } from '@/composables/games/tables/useTables'

// Toute la logique (chrono, zen, calcul du score/précision/rang) vit
// dans le composable — ce composant ne fait que de l'affichage +
// la gestion du focus de l'input (voir watch ci-dessous).
const {
  screen,
  mode,
  tables,
  score,
  errors,
  time,
  questionsAsked,
  maxQuestions,
  bestStreak,
  current,
  message,
  canStart,
  accuracy,
  rank,
  toggleTable,
  startGame,
  checkAnswer,
  restart
} = useTables()

const answer = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function submitAnswer() {
  checkAnswer(answer.value)
  answer.value = ''
  nextTick(() => inputRef.value?.focus())
}

// Refocus l'input à chaque nouvelle question générée par le composable
// (current change de valeur) — couvre le cas où le focus serait perdu
// entre deux questions sans passer par submitAnswer (ex: première
// question au lancement de la partie).
watch(current, () => {
  nextTick(() => inputRef.value?.focus())
})
</script>

<style scoped>
.tables-game {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tables-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
}

.tables-heading {
  font-size: 18px;
  color: var(--text);
  margin: 0;
}

/* MENU */
.tables-grid {
  display: grid;
  grid-template-columns: repeat(3, 64px);
  gap: var(--space-2);
}

.table-btn {
  height: 64px;
  border-radius: var(--radius-md);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--ease);
}

.table-btn:hover {
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.table-btn--selected {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}

.mode-buttons {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  justify-content: center;
}

/* GAME */
.tables-hud {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.hud-item {
  flex: 1;
  min-width: 100px;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
}

/* Note : contrairement à Hangman (--danger appliqué seulement à partir
   d'un seuil, erreurs >= 4), ici le timer chrono est TOUJOURS en couleur
   danger dès le début de la manche — traitement volontairement différent
   (signale l'urgence du mode chrono en continu, pas seulement en fin de
   temps). Pas un bug, juste un choix de design distinct entre les deux
   jeux, à garder en tête si on veut harmoniser ce genre de signal plus
   tard dans le nettoyage. */
.hud-item--timer {
  color: var(--danger);
  border-color: var(--danger);
}

.tables-chosen {
  font-size: 12px;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tables-question {
  font-size: clamp(2.2rem, 6vw, 3.2rem);
  font-weight: 700;
  color: var(--accent);
  margin: 0;
}

.tables-form {
  display: flex;
  gap: var(--space-2);
}

.tables-input {
  width: 140px;
  height: 48px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 18px;
  text-align: center;
}

.tables-input:focus {
  outline: none;
  border-color: var(--accent);
}

/* END */
.tables-result {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: 14px;
  color: var(--text-muted);
}

.tables-rank {
  margin-top: var(--space-2);
  font-weight: 600;
  color: var(--text);
}

/* TOAST */
.tables-toast {
  font-size: 12px;
  color: var(--accent);
  min-height: 16px;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity var(--ease);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}
</style>