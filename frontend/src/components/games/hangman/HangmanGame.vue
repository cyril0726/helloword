<template>
  <div class="hangman">
    <!-- Silhouette du pendu : potence fixe (toujours visible) + 6 parties
         (tête, corps, 2 bras, 2 jambes) révélées progressivement selon le
         nombre d'erreurs, via partStyle() ci-dessous -->
    <div class="hangman-figure" :class="{ shake }">
      <svg viewBox="0 0 100 120" class="hangman-svg">
        <!-- potence (toujours visible) -->
        <line x1="10" y1="110" x2="70" y2="110" stroke="var(--border-hover)" stroke-width="2" />
        <line x1="25" y1="110" x2="25" y2="10" stroke="var(--border-hover)" stroke-width="2" />
        <line x1="25" y1="10" x2="65" y2="10" stroke="var(--border-hover)" stroke-width="2" />
        <line x1="65" y1="10" x2="65" y2="22" stroke="var(--border-hover)" stroke-width="2" />

        <!-- parties du pendu, révélées selon le nombre d'erreurs -->
        <circle cx="65" cy="30" r="8" fill="none" stroke="var(--accent)" stroke-width="2"
                :style="partStyle(0)" />
        <line x1="65" y1="38" x2="65" y2="65" stroke="var(--accent)" stroke-width="2"
              :style="partStyle(1)" />
        <line x1="65" y1="45" x2="52" y2="58" stroke="var(--accent)" stroke-width="2"
              :style="partStyle(2)" />
        <line x1="65" y1="45" x2="78" y2="58" stroke="var(--accent)" stroke-width="2"
              :style="partStyle(3)" />
        <line x1="65" y1="65" x2="54" y2="85" stroke="var(--accent)" stroke-width="2"
              :style="partStyle(4)" />
        <line x1="65" y1="65" x2="76" y2="85" stroke="var(--accent)" stroke-width="2"
              :style="partStyle(5)" />
      </svg>
    </div>

    <!-- Mot à deviner (lettres trouvées + "_" pour les manquantes, calculé
         dans le composable) -->
    <p class="hangman-word">{{ motAffiche }}</p>

    <!-- Compteur d'erreurs, passe en couleur danger à partir de 4 -->
    <p class="hangman-errors" :class="{ 'hangman-errors--danger': erreurs >= 4 }">
      Erreurs : {{ erreurs }}/{{ maxErreurs }}
    </p>

    <!-- Lettres déjà utilisées (bonnes et mauvaises confondues) -->
    <p v-if="lettresUtilisees.length" class="hangman-used">
      {{ lettresUtilisees.join(' • ') }}
    </p>

    <!-- Saisie -->
    <form class="hangman-form" @submit.prevent="submitLetter">
      <input
        ref="inputRef"
        v-model="input"
        type="text"
        maxlength="1"
        class="hangman-input"
        :disabled="jeuTermine"
        placeholder="?"
        autocomplete="off"
      />
      <button type="submit" class="btn btn--primary" :disabled="jeuTermine">
        Valider
      </button>
    </form>

    <!-- Toast / message (lettre invalide, déjà jouée, victoire/défaite) -->
    <Transition name="toast">
      <p v-if="message" class="hangman-toast">{{ message }}</p>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useHangman } from '@/composables/games/hangman/useHangman'

const {
  motAffiche,
  lettresUtilisees,
  erreurs,
  maxErreurs,
  jeuTermine,
  message,
  shake,
  initialiserJeu,
  verifierLettre
} = useHangman()

const input = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

// Calcule l'opacité/échelle d'une partie du pendu (0 = tête ... 5 = dernière
// jambe) selon le nombre d'erreurs actuel — une partie apparaît dès que
// erreurs.value dépasse son index, avec une petite transition douce.
function partStyle(index: number) {
  const visible = index < erreurs.value
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'scale(1)' : 'scale(0.8)',
    transformOrigin: 'center',
    transition: 'var(--ease)'
  }
}

function submitLetter() {
  verifierLettre(input.value)
  input.value = ''
  // Attend le prochain tick (après que Vue ait fini de re-render) avant
  // de refocus, sinon le focus pourrait être perdu si le champ est
  // momentanément désactivé (ex: jeu terminé) pendant le re-render.
  nextTick(() => inputRef.value?.focus())
}

onMounted(() => {
  initialiserJeu()
  inputRef.value?.focus()
})
</script>


<style scoped>
.hangman {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  max-width: 360px;
}

.hangman-figure {
  width: 140px;
}

.hangman-figure.shake {
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.hangman-svg {
  width: 100%;
  height: auto;
}

.hangman-word {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 0.15em;
  color: var(--text);
}

.hangman-errors {
  font-size: 13px;
  color: var(--text-muted);
}

.hangman-errors--danger {
  color: var(--danger);
}

.hangman-used {
  font-size: 12px;
  color: var(--text-faint);
}

.hangman-form {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.hangman-input {
  width: 56px;
  text-align: center;
  text-transform: uppercase;
  font-size: 18px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  padding: var(--space-2);
}

.hangman-input:focus {
  outline: none;
  border-color: var(--accent);
}

.hangman-toast {
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