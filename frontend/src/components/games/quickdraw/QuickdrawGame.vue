<template>
  <div class="quickdraw-game">
    <!-- SETUP -->
    <div v-if="screen === 'setup'" class="qd-screen">
      <h2 class="qd-heading">QuickDraw</h2>
      <p class="qd-sub">Sois le plus rapide à réagir au signal.</p>

      <input
        v-model="pseudoInput"
        type="text"
        maxlength="20"
        placeholder="Ton pseudo"
        class="qd-input"
        autocomplete="off"
      />

      <button
        class="btn btn--primary"
        :disabled="loading || !pseudoInput.trim()"
        @click="handleCreate"
      >
        Créer une partie
      </button>

      <p class="qd-or">ou</p>

      <form class="join-form" @submit.prevent="handleJoin">
        <input
          v-model="joinCode"
          type="text"
          maxlength="6"
          placeholder="Code de partie"
          class="qd-input"
          autocomplete="off"
        />
        <button type="submit" class="btn" :disabled="loading || !joinCode || !pseudoInput.trim()">
          Rejoindre
        </button>
      </form>

      <Transition name="toast">
        <p v-if="message" class="qd-toast">{{ message }}</p>
      </Transition>
    </div>

    <!-- LOBBY -->
    <div v-else-if="screen === 'lobby'" class="qd-screen">
      <h2 class="qd-heading">Salle d'attente</h2>

      <div class="share-box">
        <input :value="shareUrl" readonly class="share-input" @click="selectAll" />
        <button class="btn" @click="copyLink">Copier</button>
      </div>

      <p class="qd-code">Code : <strong>{{ code }}</strong></p>

      <ul class="player-list">
        <li v-for="p in players" :key="p.pseudo" class="player-item">
          <span class="player-dot" :class="{ 'player-dot--offline': !p.connected }"></span>
          {{ p.pseudo }}
          <span class="player-score">{{ p.score }} pts</span>
        </li>
      </ul>

      <button
        v-if="isHost"
        class="btn btn--primary"
        :disabled="players.length < 2"
        @click="startRound"
      >
        {{ players.length < 2 ? 'En attente d\'un adversaire' : 'Lancer la manche' }}
      </button>
      <p v-else class="qd-hint">En attente que l'hôte lance la partie…</p>

      <Transition name="toast">
        <p v-if="message" class="qd-toast">{{ message }}</p>
      </Transition>
    </div>

    <!-- ROUND PENDING (attente du signal) -->
    <div v-else-if="screen === 'round_pending'" class="qd-screen">
      <p class="qd-round-label">Manche {{ currentRound }}/{{ maxRounds }}</p>

      <button
        class="qd-signal qd-signal--waiting"
        :class="{ 'qd-signal--faulted': roundFaulted }"
        @click="click"
      >
        {{ roundFaulted ? 'Trop tôt !' : 'Attends le signal…' }}
      </button>
    </div>

    <!-- ROUND LIVE (le signal est là) -->
    <div v-else-if="screen === 'round_live'" class="qd-screen">
      <p class="qd-round-label">Manche {{ currentRound }}/{{ maxRounds }}</p>

      <button class="qd-signal qd-signal--go" @click="click">
        CLIQUE !
      </button>

      <ul class="live-clicks">
        <li v-for="c in liveClicks" :key="c.pseudo">
          {{ c.pseudo }} — {{ c.reactionMs }}ms
        </li>
      </ul>
    </div>

    <!-- ROUND RESULT -->
    <div v-else-if="screen === 'round_result'" class="qd-screen">
      <h2 class="qd-heading">Manche {{ currentRound }}/{{ maxRounds }}</h2>

    <ol class="ranking-list">
      <li v-for="(entry, i) in lastRoundRanking" :key="entry.pseudo" class="ranking-item">
        <span class="ranking-pos">{{ i + 1 }}</span>
        {{ entry.pseudo }}
        <span class="ranking-time">{{ entry.reactionMs }}ms</span>
        <span class="ranking-points">+{{ pointsForRank(i) }}</span>
      </li>
    </ol>

      <p v-if="lastRoundFaults.length" class="qd-faults">
        Faute(s) : {{ lastRoundFaults.join(', ') }}
      </p>

      <div class="scoreboard">
        <div v-for="p in players" :key="p.pseudo" class="score-item">
          {{ p.pseudo }} : <strong>{{ p.score }}</strong>
        </div>
      </div>

      <button v-if="isHost" class="btn btn--primary" @click="startRound">
        Manche suivante
      </button>
      <p v-else class="qd-hint">En attente de l'hôte…</p>
    </div>

    <!-- GAME OVER -->
    <div v-else class="qd-screen">
      <h2 class="qd-heading">Partie terminée !</h2>

      <ol class="ranking-list">
        <li v-for="(p, i) in finalRanking" :key="p.pseudo" class="ranking-item">
          <span class="ranking-pos">{{ i + 1 }}</span>
          {{ p.pseudo }}
          <span class="ranking-time">{{ p.score }} pts</span>
        </li>
      </ol>

      <button class="btn btn--primary" @click="backToSetup">
        Nouvelle partie
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuickdraw } from '@/composables/games/quickdraw/useQuickdraw'

const route = useRoute()

const {
  screen,
  code,
  isHost,
  players,
  currentRound,
  maxRounds,
  liveClicks,
  roundFaulted,
  lastRoundRanking,
  lastRoundFaults,
  finalRanking,
  message,
  loading,
  shareUrl,
  createAndJoin,
  joinExisting,
  startRound,
  click,
  backToSetup
} = useQuickdraw()

const POINTS_BY_RANK = [3, 2, 1]

function pointsForRank(index: number): number {
  return POINTS_BY_RANK[index] ?? 0
}

const pseudoInput = ref('')
const joinCode = ref('')

onMounted(() => {
  const codeFromUrl = route.query.code as string | undefined
  if (codeFromUrl) joinCode.value = codeFromUrl.toUpperCase()
})

function handleCreate() {
  createAndJoin(pseudoInput.value.trim())
}

function handleJoin() {
  if (joinCode.value.trim() && pseudoInput.value.trim()) {
    joinExisting(joinCode.value.trim().toUpperCase(), pseudoInput.value.trim())
  }
}

function selectAll(e: Event) {
  (e.target as HTMLInputElement).select()
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
  } catch {
    // fallback silencieux : le champ reste sélectionnable manuellement
  }
}
</script>

<style scoped>
.quickdraw-game {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qd-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
}

.qd-heading {
  font-size: 18px;
  color: var(--text);
  margin: 0;
}

.qd-sub {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
  text-align: center;
}

.qd-or {
  font-size: 12px;
  color: var(--text-faint);
}

.qd-input {
  width: 100%;
  height: 40px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 14px;
  text-align: center;
}

.qd-input:focus {
  outline: none;
  border-color: var(--accent);
}

.join-form {
  display: flex;
  gap: var(--space-2);
  width: 100%;
}

.join-form .qd-input {
  flex: 1;
}

/* LOBBY */
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

.qd-code {
  font-size: 13px;
  color: var(--text-muted);
}

.qd-code strong {
  color: var(--accent);
  letter-spacing: 0.05em;
}

.player-list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.player-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  font-size: 13px;
  color: var(--text);
}

.player-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--status-live);
}

.player-dot--offline {
  background: var(--text-faint);
}

.player-score {
  margin-left: auto;
  color: var(--text-muted);
  font-size: 12px;
}

.ranking-points {
  font-weight: 700;
  color: var(--status-live);
  font-size: 12px;
}

.qd-hint {
  font-size: 13px;
  color: var(--text-muted);
}

/* ROUND */
.qd-round-label {
  font-size: 13px;
  color: var(--text-muted);
}

.qd-signal {
  width: 220px;
  height: 220px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--ease);
}

.qd-signal--waiting {
  background: var(--bg-elevated);
  color: var(--text-muted);
}

.qd-signal--faulted {
  border-color: var(--danger);
  color: var(--danger);
}

.qd-signal--go {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
  animation: pulse-go 0.5s ease;
}

@keyframes pulse-go {
  0% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

.live-clicks {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* RESULT / GAME OVER */
.ranking-list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  font-size: 13px;
  color: var(--text);
}

.ranking-pos {
  font-weight: 700;
  color: var(--accent);
  width: 18px;
}

.ranking-time {
  margin-left: auto;
  color: var(--text-muted);
  font-size: 12px;
}

.qd-faults {
  font-size: 12px;
  color: var(--danger);
}

.scoreboard {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  color: var(--text-muted);
}

.qd-toast {
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