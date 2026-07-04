<template>
  <div class="flags-game">
    <p v-if="loading" class="flags-status">Chargement des données…</p>
    <p v-else-if="loadError" class="flags-status flags-status--error">
      Impossible de charger les drapeaux.
    </p>

    <template v-else>
      <!-- SELECTION -->
      <div v-if="screen === 'continents'" class="flags-screen">
        <h2 class="flags-heading">Choisis tes continents</h2>

        <div class="continent-list">
          <button
            v-for="c in continentsList"
            :key="c"
            class="continent-btn"
            :class="{ 'continent-btn--selected': selectedContinents.includes(c) }"
            @click="toggleContinent(c)"
          >
            {{ c }}
          </button>
        </div>

        <div class="difficulty-list">
          <button
            v-for="level in (['facile', 'moyen', 'difficile'] as const)"
            :key="level"
            class="difficulty-btn"
            :class="{ 'difficulty-btn--selected': selectedDifficulty === level }"
            :disabled="!canStart"
            @click="selectDifficulty(level)"
          >
            {{ level === 'facile' ? '🟢 Facile' : level === 'moyen' ? '🟡 Normal' : '🔴 Difficile' }}
          </button>
        </div>

        <button
          class="btn btn--primary"
          :disabled="!canStart"
          @click="startQuizFromSelection"
        >
          Lancer le quiz
        </button>

        <Transition name="toast">
          <p v-if="message" class="flags-toast">{{ message }}</p>
        </Transition>
      </div>

      <!-- QUIZ -->
      <div v-else-if="screen === 'quiz'" class="flags-screen">
        <div class="flags-hud">
          <div class="hud-item">Score : {{ score }}</div>
          <div class="hud-item">Série : {{ streak }}</div>
          <div class="hud-item">{{ progressLabel }}</div>
          <div class="hud-item">⏱ {{ formattedTime }}</div>
        </div>

        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
        </div>

        <p class="flags-question">{{ questionLabel }}</p>

        <img
          v-if="currentQuestion"
          :src="currentQuestion.drapeau"
          :alt="currentQuestion.pays"
          class="flags-flag"
          :class="{
            'flags-flag--correct': flagAnim === 'correct',
            'flags-flag--wrong': flagAnim === 'wrong'
          }"
        />

        <div class="options-grid">
          <button
            v-for="opt in options"
            :key="opt"
            class="option-btn"
            :class="{
              'option-btn--correct': locked && opt === correctOption,
              'option-btn--wrong': locked && opt === selectedOption && opt !== correctOption,
              'option-btn--locked': locked
            }"
            :disabled="locked"
            @click="handleAnswer(opt)"
          >
            {{ opt }}
          </button>
        </div>
      </div>

      <!-- END -->
      <div v-else class="flags-screen">
        <h2 class="flags-heading">Quiz terminé</h2>

        <div class="flags-result">
          <p>🌍 Continents : {{ selectedContinents.join(', ') }}</p>
          <p>🎚 Difficulté : {{ selectedDifficulty }}</p>
          <p>⭐ Score : {{ score }}/{{ totalAnswers }}</p>
          <p>🔥 Meilleure série : {{ bestStreak }}</p>
          <p>🎯 Précision : {{ accuracy }}%</p>
          <p>⏱ Temps : {{ formattedTime }}</p>
          <p class="flags-rank">{{ rank }}</p>
        </div>

        <div class="end-actions">
          <button class="btn btn--primary" @click="restartQuiz">Rejouer</button>
          <button class="btn" @click="backToContinentSelection">Changer de continents</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useFlags } from '@/composables/games/flags/useFlags'

const {
  loading,
  loadError,
  screen,
  continentsList,
  selectedContinents,
  selectedDifficulty,
  currentQuestion,
  score,
  streak,
  bestStreak,
  totalAnswers,
  options,
  locked,
  selectedOption,
  correctOption,
  flagAnim,
  message,
  canStart,
  formattedTime,
  accuracy,
  rank,
  progressPercent,
  progressLabel,
  questionLabel,
  toggleContinent,
  selectDifficulty,
  startQuizFromSelection,
  handleAnswer,
  restartQuiz,
  backToContinentSelection
} = useFlags()
</script>

<style scoped>
.flags-game {
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.flags-status {
  color: var(--text-muted);
  font-size: 13px;
}

.flags-status--error {
  color: var(--danger);
}

.flags-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
}

.flags-heading {
  font-size: 18px;
  color: var(--text);
  margin: 0;
}

/* SELECTION */
.continent-list,
.difficulty-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: center;
}

.continent-btn,
.difficulty-btn {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: var(--ease);
}

.continent-btn:hover,
.difficulty-btn:hover:not(:disabled) {
  border-color: var(--border-hover);
  color: var(--text);
}

.continent-btn--selected,
.difficulty-btn--selected {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}

.difficulty-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* QUIZ */
.flags-hud {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.hud-item {
  flex: 1;
  min-width: 90px;
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 12px;
  text-align: center;
}

.progress-track {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: var(--bg-elevated);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.25s ease;
}

.flags-question {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

.flags-flag {
  width: 140px;
  height: auto;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  transition: var(--ease);
}

.flags-flag--correct {
  border-color: var(--status-live);
  box-shadow: 0 0 0 3px var(--status-live-bg);
}

.flags-flag--wrong {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px var(--danger-bg);
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
  width: 100%;
}

.option-btn {
  padding: var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  transition: var(--ease);
}

.option-btn:hover:not(:disabled) {
  border-color: var(--border-hover);
}

.option-btn--correct {
  border-color: var(--status-live);
  background: var(--status-live-bg);
  color: var(--status-live);
}

.option-btn--wrong {
  border-color: var(--danger);
  background: var(--danger-bg);
  color: var(--danger);
}

.option-btn--locked {
  cursor: default;
}

/* END */
.flags-result {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
}

.flags-rank {
  margin-top: var(--space-2);
  font-weight: 600;
  color: var(--text);
}

.end-actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  justify-content: center;
}

.flags-toast {
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