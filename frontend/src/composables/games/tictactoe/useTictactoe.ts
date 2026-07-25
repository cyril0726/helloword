import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type Board = string[]
type Role = 'X' | 'O' | null
type Screen = 'setup' | 'waiting' | 'playing' | 'finished'

interface SessionState {
  code: string
  board: Board
  currentPlayer: 'X' | 'O'
  playerXJoined: boolean
  playerOJoined: boolean
  status: 'waiting' | 'playing' | 'finished'
  winner: string | null
}

const API_BASE = `${import.meta.env.VITE_API_URL}/api/tictactoe`
const POLL_INTERVAL_MS = 1500

export function useTictactoe() {
  const route = useRoute()
  const router = useRouter()

  const screen = ref<Screen>('setup')
  const code = ref<string | null>(null)
  const role = ref<Role>(null)
  const board = ref<Board>(Array(9).fill(''))
  const currentPlayer = ref<'X' | 'O'>('X')
  const playerXJoined = ref(false)
  const playerOJoined = ref(false)
  const winner = ref<string | null>(null)
  const message = ref('')
  const loading = ref(false)

  let pollId: ReturnType<typeof setInterval> | null = null

  const shareUrl = computed(() => {
    if (!code.value) return ''
    return `${window.location.origin}/lab/tictactoe?code=${code.value}`
  })

  const isMyTurn = computed(() => role.value === currentPlayer.value)

  const resultLabel = computed(() => {
    if (!winner.value) return ''
    if (winner.value === 'draw') return 'Match nul !'
    return winner.value === role.value ? 'Tu as gagné !' : 'Tu as perdu.'
  })

  function afficherMessage(texte: string, dureeMs = 2500) {
    message.value = texte
    setTimeout(() => {
      if (message.value === texte) message.value = ''
    }, dureeMs)
  }

  async function apiCall<T>(path: string, options?: RequestInit): Promise<T | null> {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      })
      const data = await res.json()
      if (!res.ok) {
        afficherMessage(data.error || 'Une erreur est survenue')
        return null
      }
      return data as T
    } catch (e) {
      afficherMessage('Impossible de contacter le serveur')
      return null
    }
  }

  function applyState(state: SessionState) {
    board.value = state.board
    currentPlayer.value = state.currentPlayer
    playerXJoined.value = state.playerXJoined
    playerOJoined.value = state.playerOJoined
    winner.value = state.winner

    if (state.status === 'finished') {
      screen.value = 'finished'
    } else if (state.status === 'playing') {
      screen.value = 'playing'
    } else {
      screen.value = 'waiting'
    }
  }

  function startPolling() {
    stopPolling()
    pollId = setInterval(async () => {
      if (!code.value) return
      const state = await apiCall<SessionState>(`/${code.value}`)
      if (state) applyState(state)
    }, POLL_INTERVAL_MS)
  }

  function stopPolling() {
    if (pollId) {
      clearInterval(pollId)
      pollId = null
    }
  }

  async function createGame() {
    loading.value = true
    const result = await apiCall<{ code: string; role: 'X' }>('/create', { method: 'POST' })
    loading.value = false

    if (!result) return

    code.value = result.code
    role.value = result.role
    screen.value = 'waiting'

    router.replace({ query: { ...route.query, code: result.code } })
    startPolling()
  }

  async function joinGame(codeToJoin: string) {
    loading.value = true
    const result = await apiCall<{ code: string; role: 'O' }>(`/${codeToJoin}/join`, { method: 'POST' })
    loading.value = false

    if (!result) return

    code.value = result.code
    role.value = result.role

    router.replace({ query: { ...route.query, code: result.code } })

    const state = await apiCall<SessionState>(`/${code.value}`)
    if (state) applyState(state)

    startPolling()
  }

  async function playMove(index: number) {
    if (!code.value || !role.value) return
    if (!isMyTurn.value) {
      afficherMessage("Ce n'est pas ton tour")
      return
    }
    if (board.value[index] !== '') return

    // Mise à jour optimiste locale (affichage immédiat du coup avant même
    // la réponse serveur, pour éviter toute latence perçue). Le GET
    // immédiat juste après (plutôt que d'attendre le prochain tick de
    // polling, jusqu'à 1.5s plus tard) sert précisément à corriger vite
    // cet affichage optimiste si jamais le serveur refusait le coup —
    // fenêtre d'incohérence potentielle très courte (le temps d'un
    // aller-retour réseau), pas totalement nulle mais réduite au minimum.
    board.value[index] = role.value

    await apiCall(`/${code.value}/move`, {
      method: 'POST',
      body: JSON.stringify({ index, player: role.value })
    })

    const state = await apiCall<SessionState>(`/${code.value}`)
    if (state) applyState(state)
  }

  async function rematch() {
    if (!code.value) return
    await apiCall(`/${code.value}/rematch`, { method: 'POST' })
    const state = await apiCall<SessionState>(`/${code.value}`)
    if (state) applyState(state)
  }

  function backToSetup() {
    stopPolling()
    code.value = null
    role.value = null
    board.value = Array(9).fill('')
    winner.value = null
    screen.value = 'setup'
    router.replace({ query: {} })
  }

  // Auto-join dès qu'un ?code= est présent dans l'URL, SANS confirmation
  // intermédiaire — différent du choix fait sur QuickDraw (écran "mode
  // invité" séparé, qui demande d'abord un pseudo). Ici, aucun pseudo
  // n'est nécessaire (juste un rôle X/O attribué automatiquement), donc
  // rien ne justifie une étape de confirmation avant de rejoindre : le
  // clic sur le lien partagé suffit à lancer la connexion.
  onMounted(async () => {
    const codeFromUrl = route.query.code as string | undefined
    if (codeFromUrl) {
      await joinGame(codeFromUrl.toUpperCase())
    }
  })

  onBeforeUnmount(stopPolling)

  return {
    screen,
    code,
    role,
    board,
    currentPlayer,
    playerXJoined,
    playerOJoined,
    winner,
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
  }
}