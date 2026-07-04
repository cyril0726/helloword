import { ref, computed, onBeforeUnmount } from 'vue'

export type GameScreen = 'menu' | 'game' | 'end'
export type GameMode = 'chrono' | 'zen'

const MAX_QUESTIONS = 20
const CHRONO_DURATION = 60

export function useTables() {
  const screen = ref<GameScreen>('menu')
  const mode = ref<GameMode>('zen')
  const tables = ref<number[]>([])

  const score = ref(0)
  const errors = ref(0)
  const time = ref(CHRONO_DURATION)
  const questionsAsked = ref(0)
  const streak = ref(0)
  const bestStreak = ref(0)

  const current = ref<{ t: number; m: number } | null>(null)
  const message = ref('')

  let intervalId: ReturnType<typeof setInterval> | null = null

  const canStart = computed(() => tables.value.length > 0)

  const progressPercent = computed(() => (questionsAsked.value / MAX_QUESTIONS) * 100)

  const accuracy = computed(() => {
    if (mode.value !== 'zen' || questionsAsked.value === 0) return null
    return Math.round((score.value / questionsAsked.value) * 100)
  })

  const rank = computed(() => {
    if (mode.value !== 'zen') return '⏱ Mode Challenge terminé'
    const acc = accuracy.value ?? 0
    if (acc >= 95) return '🧠 Génie des multiplications'
    if (acc >= 80) return '🚀 Calculateur expert'
    if (acc >= 60) return '📚 Bon niveau'
    return '🌱 En progression'
  })

  function toggleTable(n: number) {
    if (tables.value.includes(n)) {
      tables.value = tables.value.filter(x => x !== n)
    } else {
      tables.value.push(n)
    }
  }

  function afficherMessage(texte: string, dureeMs = 2000) {
    message.value = texte
    setTimeout(() => {
      if (message.value === texte) message.value = ''
    }, dureeMs)
  }

  function resetStats() {
    score.value = 0
    errors.value = 0
    time.value = CHRONO_DURATION
    questionsAsked.value = 0
    streak.value = 0
    bestStreak.value = 0
    clearTimer()
  }

  function clearTimer() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function startGame(selectedMode: GameMode) {
    if (!canStart.value) {
      afficherMessage('Choisis au moins une table')
      return
    }

    mode.value = selectedMode
    resetStats()
    screen.value = 'game'
    nextQuestion()

    if (selectedMode === 'chrono') {
      intervalId = setInterval(() => {
        time.value--
        if (time.value <= 0) endGame()
      }, 1000)
    }
  }

  function nextQuestion() {
    if (mode.value === 'zen' && questionsAsked.value >= MAX_QUESTIONS) {
      endGame()
      return
    }

    questionsAsked.value++

    const t = tables.value[Math.floor(Math.random() * tables.value.length)]
    const m = Math.floor(Math.random() * 10) + 1
    current.value = { t, m }
  }

  function checkAnswer(rawValue: string) {
    if (screen.value !== 'game' || !current.value) return

    const val = rawValue.trim()

    if (val === '') {
      afficherMessage('Entre une réponse !')
      return
    }

    const num = Number(val)

    if (Number.isNaN(num)) {
      afficherMessage('Réponse invalide !')
      return
    }

    if (num === current.value.t * current.value.m) {
      score.value++
      streak.value++
      if (streak.value > bestStreak.value) bestStreak.value = streak.value
    } else {
      errors.value++
      streak.value = 0
    }

    nextQuestion()
  }

  function endGame() {
    clearTimer()
    screen.value = 'end'
  }

  function restart() {
    tables.value = []
    resetStats()
    current.value = null
    screen.value = 'menu'
  }

  onBeforeUnmount(clearTimer)

  return {
    // state
    screen,
    mode,
    tables,
    score,
    errors,
    time,
    questionsAsked,
    maxQuestions: MAX_QUESTIONS,
    streak,
    bestStreak,
    current,
    message,
    // computed
    canStart,
    progressPercent,
    accuracy,
    rank,
    // actions
    toggleTable,
    startGame,
    checkAnswer,
    restart
  }
}