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

  let ws: WebSocket | null = null

  const isConnected = computed(() => ws !== null && ws.readyState === WebSocket.OPEN)

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
    // le code est généré côté serveur via un premier appel HTTP, puis on rejoint en websocket
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