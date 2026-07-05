<template>
  <div class="tictactoe-game">
    <!-- SETUP -->
    <div v-if="screen === 'setup'" class="tictactoe-screen">
      <h2 class="tictactoe-heading">Défie un ami</h2>

      <button class="btn btn--primary" :disabled="loading" @click="createGame">
        Créer une partie
      </button>

      <p class="tictactoe-or">ou</p>

      <form class="join-form" @submit.prevent="handleJoin">
        <input
          v-model="joinCode"
          type="text"
          maxlength="6"
          placeholder="Code de partie"
          class="join-input"
          autocomplete="off"
        />
        <button type="submit" class="btn" :disabled="loading || !joinCode">
          Rejoindre
        </button>
      </form>

      <Transition name="toast">
        <p v-if="message" class="tictactoe-toast">{{ message }}</p>
      </Transition>
    </div>

    <!-- WAITING -->
    <div v-else-if="screen === 'waiting'" class="tictactoe-screen">
      <h2 class="tictactoe-heading">En attente d'un adversaire</h2>

      <p class="tictactoe-hint">Partage ce lien :</p>

      <div class="share-box">
        <input :value="shareUrl" readonly class="share-input" @click="selectAll" />
        <button class="btn" @click="copyLink">Copier</button>
      </div>

      <p class="tictactoe-code">Code : <strong>{{ code }}</strong></p>

      <button class="btn" @click="backToSetup">Annuler</button>
    </div>

    <!-- PLAYING -->
    <div v-else-if="screen === 'playing'" class="tictactoe-screen">
      <p class="tictactoe-role">
        Tu joues : <strong>{{ role }}</strong>
      </p>

      <p class="tictactoe-turn" :class="{ 'tictactoe-turn--active': isMyTurn }">
        {{ isMyTurn ? 'À toi de jouer' : "Tour de l'adversaire" }}
      </p>

      <div class="board">
        <button
          v-for="(cell, i) in board"
          :key="i"
          class="cell"
          :class="{ 'cell--filled': cell !== '' }"
          :disabled="cell !== '' || !isMyTurn"
          @click="playMove(i)"
        >
          {{ cell }}
        </button>
      </div>

      <Transition name="toast">
        <p v-if="message" class="tictactoe-toast">{{ message }}</p>
      </Transition>
    </div>

    <!-- FINISHED -->
    <div v-else class="tictactoe-screen">
      <h2 class="tictactoe-heading">{{ resultLabel }}</h2>

      <div class="board board--readonly">
        <div
          v-for="(cell, i) in board"
          :key="i"
          class="cell"
          :class="{ 'cell--filled': cell !== '' }"
        >
          {{ cell }}
        </div>
      </div>

      <div class="end-actions">
        <button class="btn btn--primary" @click="rematch">Revanche</button>
        <button class="btn" @click="backToSetup">Nouvelle partie</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTictactoe } from '@/composables/games/tictactoe/useTictactoe'

const {
  screen,
  code,
  role,
  board,
  message,
  loading,
  shareUrl,
  isMyTurn,
  resultLabel,
  createGame,
  joinGame,
  playMove,
  rematch,
  backToSetup
} = useTictactoe()

const joinCode = ref('')

function handleJoin() {
  if (joinCode.value.trim()) {
    joinGame(joinCode.value.trim().toUpperCase())
  }
}

function selectAll(e: Event) {
  (e.target as HTMLInputElement).select()
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
  } catch {
    // silencieux : le champ reste sélectionnable manuellement en fallback
  }
}
</script>

<style scoped>
.tictactoe-game {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tictactoe-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
}

.tictactoe-heading {
  font-size: 18px;
  color: var(--text);
  margin: 0;
}

.tictactoe-or {
  font-size: 12px;
  color: var(--text-faint);
}

.join-form {
  display: flex;
  gap: var(--space-2);
  width: 100%;
}

.join-input {
  flex: 1;
  height: 40px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 14px;
  text-transform: uppercase;
}

.join-input:focus {
  outline: none;
  border-color: var(--accent);
}

/* WAITING */
.tictactoe-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.share-box {
  display: flex;
  gap: var(--space-2);
  width: 100%;
}

.share-input {
  flex: 1;
  height: 40px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 12px;
}

.tictactoe-code {
  font-size: 13px;
  color: var(--text-muted);
}

.tictactoe-code strong {
  color: var(--accent);
  letter-spacing: 0.05em;
}

/* PLAYING */
.tictactoe-role {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.tictactoe-turn {
  font-size: 14px;
  color: var(--text-faint);
  margin: 0;
}

.tictactoe-turn--active {
  color: var(--accent);
  font-weight: 600;
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 72px);
  grid-template-rows: repeat(3, 72px);
  gap: var(--space-2);
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 28px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--ease);
}

.cell:hover:not(:disabled) {
  border-color: var(--accent);
}

.cell:disabled {
  cursor: not-allowed;
}

.cell--filled {
  color: var(--accent);
}

.board--readonly .cell {
  cursor: default;
}

/* END */
.end-actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  justify-content: center;
}

.tictactoe-toast {
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