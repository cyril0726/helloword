<template>
  <div class="quickdraw-game">
    <!-- SETUP : deux sous-modes distincts selon la provenance du joueur -->
    <div v-if="screen === 'setup'" class="qd-screen">
      <h2 class="qd-heading">QuickDraw</h2>

      <!-- MODE INVITE : arrivée via un lien partagé (?code=... dans l'URL).
           Le code est déjà connu, on ne demande que le pseudo — voir
           /docs/Architecture.md pour le choix de séparer ce flow du mode
           normal plutôt que d'afficher "Créer" et "Rejoindre" en même
           temps à quelqu'un qui a clairement l'intention de rejoindre.

           🐛 CORRIGÉ : ce bloc n'était pas enveloppé dans un <form>,
           contrairement au mode normal ci-dessous — taper Entrée après
           le pseudo ne déclenchait rien, il fallait cliquer. Enveloppé
           maintenant dans un <form @submit.prevent="handleJoin"> pour
           un comportement cohérent entre les deux modes. -->
      <template v-if="isInviteMode">
        <p class="qd-sub">🎯 Invitation reçue</p>

        <p class="qd-code">
          Code : <strong>{{ joinCode }}</strong>
        </p>

        <form class="invite-form" @submit.prevent="handleJoin">
          <input
            v-model="pseudoInput"
            type="text"
            maxlength="20"
            placeholder="Ton pseudo"
            class="qd-input"
            autocomplete="off"
          />

          <button
            type="submit"
            class="btn btn--primary"
            :disabled="loading || !pseudoInput.trim()"
          >
            Rejoindre la partie
          </button>
        </form>

        <button class="qd-link-alt" @click="codeFromUrl = null">
          Créer ma propre partie à la place
        </button>
      </template>

      <!-- MODE NORMAL : ni code ni intention précise, on propose les deux
           options (créer ou rejoindre via un code tapé à la main) -->
      <template v-else>
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
      </template>

      <Transition name="toast">
        <p v-if="message" class="qd-toast">{{ message }}</p>
      </Transition>
    </div>

    <!-- LOBBY : salle d'attente, partage du lien, liste des joueurs connectés -->
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

      <!-- Seul l'hôte peut lancer, et seulement s'il y a au moins 2 joueurs
           (garde-fou côté frontend — le backend n'empêche pas explicitement
           une manche à 1 seul joueur, voir QuickdrawRoom.ts) -->
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

    <!-- ROUND PENDING : attente du signal. Un clic ici = faute (voir
         useQuickdraw / QuickdrawRoom.ts), le bouton reste cliquable pour
         permettre ce test/cette faute, contrairement à round_live où un
         joueur déjà en faute voit son bouton désactivé. -->
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

    <!-- ROUND LIVE : le signal "go" est arrivé. Un joueur déjà en faute
         (roundFaulted) garde un bouton désactivé, il ne doit plus pouvoir
         re-cliquer même si le signal apparaît. -->
    <div v-else-if="screen === 'round_live'" class="qd-screen">
      <p class="qd-round-label">Manche {{ currentRound }}/{{ maxRounds }}</p>

      <button
        class="qd-signal"
        :class="roundFaulted ? 'qd-signal--faulted' : 'qd-signal--go'"
        :disabled="roundFaulted"
        @click="click"
      >
        {{ roundFaulted ? 'Trop tôt !' : 'CLIQUE !' }}
      </button>

      <!-- Diffusion "live" des clics des autres joueurs, au fur et à
           mesure qu'ils arrivent (pas d'attente de la fin de manche) -->
      <ul class="live-clicks">
        <li v-for="c in liveClicks" :key="c.pseudo">
          {{ c.pseudo }} — {{ c.reactionMs }}ms
        </li>
      </ul>
    </div>

    <!-- ROUND RESULT : classement de la manche + points gagnés + scores cumulés -->
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

    <!-- GAME OVER : classement final -->
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
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuickdraw } from '@/composables/games/quickdraw/useQuickdraw'

const route = useRoute()

// codeFromUrl déclaré avant isInviteMode qui le référence — fonctionnait
// dans les deux ordres grâce à l'évaluation paresseuse des computed, mais
// cet ordre est plus lisible : la donnée avant ce qui en dépend.
const codeFromUrl = ref<string | null>(null)
const isInviteMode = computed(() => !!codeFromUrl.value)

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

// ⚠️ Dupliqué avec POINTS_BY_RANK dans backend/QuickdrawRoom.ts — sert
// uniquement à AFFICHER le "+3/+2/+1" gagné par manche, le calcul réel
// des scores (source de vérité) est fait côté serveur. Si le barème
// change un jour côté backend, penser à mettre à jour cette copie aussi,
// sinon l'affichage mentirait sur les points réellement gagnés.
// Alternative plus robuste évoquée à la conception : faire envoyer
// directement "pointsEarned" par le serveur dans round_result plutôt que
// de le recalculer ici — non fait pour l'instant.
const POINTS_BY_RANK = [3, 2, 1]

function pointsForRank(index: number): number {
  return POINTS_BY_RANK[index] ?? 0
}

const pseudoInput = ref('')
const joinCode = ref('')

// Détecte un ?code=... dans l'URL au chargement (lien d'invitation) —
// pré-remplit le code ET bascule l'écran en mode invité (isInviteMode).
onMounted(() => {
  const fromQuery = route.query.code as string | undefined
  if (fromQuery) {
    codeFromUrl.value = fromQuery.toUpperCase()
    joinCode.value = fromQuery.toUpperCase()
  }
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
    // (nécessite HTTPS en prod — fonctionne en HTTP seulement sur localhost)
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

/* Même structure/gap que .join-form (mode normal) pour une cohérence
   visuelle entre les deux modes de saisie. */
.invite-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
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

.qd-link-alt {
  background: none;
  border: none;
  color: var(--text-faint);
  font-size: 12px;
  text-decoration: underline;
  cursor: pointer;
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