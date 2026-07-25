import { ref, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type Screen = 'setup' | 'lobby' | 'round_pending' | 'round_live' | 'round_result' | 'game_over'

interface PlayerInfo {
  pseudo: string
  connected: boolean
  score: number
}

interface ClickEntry {
  pseudo: string
  reactionMs: number
}

// Dérive l'URL WebSocket depuis VITE_API_URL (http→ws, https→wss) — évite
// de dupliquer une variable d'environnement séparée juste pour le protocole.
const WS_BASE = (import.meta.env.VITE_API_URL as string).replace(/^http/, 'ws')

export function useQuickdraw() {
  const route = useRoute()
  const router = useRouter()

  const screen = ref<Screen>('setup')
  const code = ref<string | null>(null)
  const pseudo = ref<string | null>(null)
  const isHost = ref(false)
  const players = ref<PlayerInfo[]>([])
  const currentRound = ref(0)
  const maxRounds = ref(5)

  const liveClicks = ref<ClickEntry[]>([])
  const roundFaulted = ref(false)
  const lastRoundRanking = ref<ClickEntry[]>([])
  const lastRoundFaults = ref<string[]>([])
  const finalRanking = ref<PlayerInfo[]>([])

  const message = ref('')
  const loading = ref(false)

  // Variable JS classique, PAS une ref — voir le bug signalé sur
  // isConnected juste en dessous, directement lié à ce choix.
  let ws: WebSocket | null = null

  // 🐛 BUG DE RÉACTIVITÉ (non corrigé, actuellement sans impact car
  // inutilisé) : ce computed lit `ws`, une variable JS normale et non une
  // ref — Vue ne peut suivre aucun changement dessus. Un computed() ne se
  // réévalue que lorsqu'une dépendance RÉACTIVE qu'il a lue change ; ici
  // il n'en lit aucune, donc sa valeur se fige dès sa première évaluation
  // et ne se met plus jamais à jour, même une fois la connexion établie.
  // Pour corriger un jour : soit exposer un ref séparé mis à jour
  // manuellement dans ws.onopen/onclose, soit stocker ws lui-même dans un
  // shallowRef. Ni isConnected ni myScore (juste en dessous) ne sont
  // actuellement consommés par QuickdrawGame.vue — code mort côté
  // interface, donc ce bug reste dormant pour l'instant.
  const isConnected = computed(() => ws !== null && ws.readyState === WebSocket.OPEN)

  // Celui-ci, en revanche, est correctement réactif (players et pseudo
  // sont bien des refs) — mais également non utilisé par le composant
  // actuel, exporté "au cas où" sans consommateur pour l'instant.
  const myScore = computed(() => {
    return players.value.find(p => p.pseudo === pseudo.value)?.score ?? 0
  })

  function afficherMessage(texte: string, dureeMs = 2500) {
    message.value = texte
    setTimeout(() => {
      if (message.value === texte) message.value = ''
    }, dureeMs)
  }

  function connectAndJoin(targetCode: string, targetPseudo: string) {
    loading.value = true
    code.value = targetCode.toUpperCase()
    pseudo.value = targetPseudo

    ws = new WebSocket(`${WS_BASE}/api/quickdraw/${code.value}/ws`)

    ws.onopen = () => {
      ws?.send(JSON.stringify({ type: 'join', pseudo: targetPseudo }))
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      handleMessage(data)
    }

    ws.onerror = () => {
      loading.value = false
      afficherMessage('Erreur de connexion au serveur')
    }

    // ⚠️ Se contente d'afficher un toast, sans proposer de chemin de
    // retour à l'utilisateur si la connexion tombe en pleine partie
    // (ex: round_live) — l'écran reste affiché avec un socket mort,
    // aucun bouton "revenir au menu" ni tentative de reconnexion
    // automatique. À améliorer si les coupures deviennent un vrai souci
    // en usage réel (ex: appeler backToSetup() automatiquement après un
    // délai, ou tenter une reconnexion avec le même pseudo — le backend
    // le permet déjà, voir QuickdrawRoom.ts / handleJoin).
    ws.onclose = () => {
      if (screen.value !== 'setup') {
        afficherMessage('Connexion perdue')
      }
    }
  }

  function handleMessage(data: any) {
    switch (data.type) {
      case 'joined':
        loading.value = false
        isHost.value = data.isHost
        currentRound.value = data.currentRound
        maxRounds.value = data.maxRounds
        players.value = data.players
        screen.value = 'lobby'
        router.replace({ query: { ...route.query, code: code.value } })
        break

      case 'error':
        loading.value = false
        afficherMessage(data.message)
        break

      case 'player_list':
        players.value = data.players
        break

      case 'round_pending':
        currentRound.value = data.round
        maxRounds.value = data.maxRounds
        liveClicks.value = []
        roundFaulted.value = false
        screen.value = 'round_pending'
        break

      case 'go':
        screen.value = 'round_live'
        break

      case 'fault':
        roundFaulted.value = true
        afficherMessage('Trop tôt !')
        break

      case 'player_faulted':
        // info live, pas d'action nécessaire côté état hormis un message discret
        break

      case 'player_clicked':
        liveClicks.value.push({ pseudo: data.pseudo, reactionMs: data.reactionMs })
        break

      case 'round_result':
        lastRoundRanking.value = data.ranking
        lastRoundFaults.value = data.faults
        players.value = data.scores
        screen.value = 'round_result'
        break

      case 'game_over':
        finalRanking.value = data.finalRanking
        screen.value = 'game_over'
        break
    }
  }

  function createGame() {
    // Le code est généré côté serveur via un premier appel HTTP classique
    // (pas de WebSocket à ce stade), puis on rejoint en websocket juste
    // après — d'où la réutilisation directe de VITE_API_URL ici plutôt
    // que WS_BASE (qui a déjà été converti en ws://, inadapté à un fetch
    // HTTP classique).
    return fetch(`${import.meta.env.VITE_API_URL}/api/quickdraw/create`, { method: 'POST' })
      .then(r => r.json())
      .then((data: { code: string }) => data.code)
  }

  async function createAndJoin(targetPseudo: string) {
    loading.value = true
    const newCode = await createGame()
    connectAndJoin(newCode, targetPseudo)
  }

  function joinExisting(targetCode: string, targetPseudo: string) {
    connectAndJoin(targetCode, targetPseudo)
  }

  function startRound() {
    ws?.send(JSON.stringify({ type: 'start_round' }))
  }

  function click() {
    if (screen.value !== 'round_pending' && screen.value !== 'round_live') return
    ws?.send(JSON.stringify({ type: 'click' }))
  }

  // L'ordre des opérations ici évite un faux message "Connexion perdue" :
  // screen.value passe à 'setup' de façon SYNCHRONE, avant même que
  // l'événement 'close' asynchrone du WebSocket ne se déclenche — quand
  // ws.onclose s'exécute enfin, la condition screen.value !== 'setup'
  // est déjà fausse, donc pas de toast déclenché sur une fermeture
  // volontaire (contrairement à une vraie coupure de connexion).
  function backToSetup() {
    ws?.close()
    ws = null
    screen.value = 'setup'
    code.value = null
    pseudo.value = null
    players.value = []
    router.replace({ query: {} })
  }

  const shareUrl = computed(() => {
    if (!code.value) return ''
    return `${window.location.origin}/lab/quickdraw?code=${code.value}`
  })

  onBeforeUnmount(() => {
    ws?.close()
  })

  return {
    screen,
    code,
    pseudo,
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
    isConnected,
    myScore,
    shareUrl,
    createAndJoin,
    joinExisting,
    startRound,
    click,
    backToSetup
  }
}