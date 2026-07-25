import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

interface Country {
  pays: string
  capitale: string
  difficulte: 'facile' | 'moyen' | 'difficile'
  drapeau: string
}

interface FlagsData {
  continents: Record<string, Country[]>
}

type Screen = 'continents' | 'quiz' | 'end'
type Step = 'pays' | 'capitale'
type Difficulty = 'facile' | 'moyen' | 'difficile'

const DIFFICULTY_LEVELS: Record<Difficulty, Difficulty[]> = {
  facile: ['facile'],
  moyen: ['facile', 'moyen'],
  difficile: ['facile', 'moyen', 'difficile']
}

export function useFlags() {
  const data = ref<FlagsData | null>(null)
  const loading = ref(true)
  const loadError = ref(false)

  const screen = ref<Screen>('continents')
  const selectedContinents = ref<string[]>([])
  const selectedDifficulty = ref<Difficulty>('facile')

  const currentQuestions = ref<Country[]>([])
  const currentQuestion = ref<Country | null>(null)
  // continent d'origine de la question en cours, pour restreindre les options
  const currentContinent = ref<string | null>(null)
  const currentStep = ref<Step>('pays')

  const score = ref(0)
  const streak = ref(0)
  const bestStreak = ref(0)
  const totalAnswers = ref(0)
  const roundsPlayed = ref(0)
  const maxRounds = ref(20)

  const options = ref<string[]>([])
  const locked = ref(false)
  const selectedOption = ref<string | null>(null)
  const correctOption = ref<string | null>(null)
  const flagAnim = ref<'correct' | 'wrong' | null>(null)

  const elapsedSeconds = ref(0)
  let timerInterval: ReturnType<typeof setInterval> | null = null
  let startTime = 0

  const message = ref('')

  const continentsList = computed(() => {
    return data.value ? Object.keys(data.value.continents) : []
  })

  const canStart = computed(() => selectedContinents.value.length > 0)

  const formattedTime = computed(() => {
    const m = String(Math.floor(elapsedSeconds.value / 60)).padStart(2, '0')
    const s = String(elapsedSeconds.value % 60).padStart(2, '0')
    return `${m}:${s}`
  })

  const accuracy = computed(() => {
    return totalAnswers.value === 0 ? 0 : Math.round((score.value / totalAnswers.value) * 100)
  })

  const rank = computed(() => {
    const acc = accuracy.value
    if (acc >= 95) return '🌍 Maître des drapeaux'
    if (acc >= 80) return '🧭 Explorateur expert'
    if (acc >= 60) return '✈️ Voyageur confirmé'
    return '🚀 Apprenti géographe'
  })

  const progressPercent = computed(() => (roundsPlayed.value / maxRounds.value) * 100)
  const progressLabel = computed(() => `${Math.min(roundsPlayed.value + 1, maxRounds.value)}/${maxRounds.value}`)

  const questionLabel = computed(() => {
    if (!currentQuestion.value) return ''
    return currentStep.value === 'pays'
      ? 'Quel est ce pays ?'
      : `Quelle est la capitale de ${currentQuestion.value.pays} ?`
  })

  // Chemin RELATIF, sans VITE_API_URL — volontaire, contrairement aux
  // composables de jeux multijoueurs (useTictactoe, useQuickdraw) qui
  // appellent le backend Worker. Ici, le JSON est un asset STATIQUE servi
  // par le frontend lui-même (dossier /public, voir /docs/Architecture.md),
  // pas une donnée qui vit côté serveur — donc pas d'URL de backend à
  // préfixer, juste un chemin relatif au domaine du site.
  async function loadData() {
    try {
      const res = await fetch('/data/games/flags/flags.json')
      if (!res.ok) throw new Error(String(res.status))
      data.value = await res.json()
    } catch (e) {
      loadError.value = true
      console.error('Erreur chargement data:', e)
    } finally {
      loading.value = false
    }
  }

  function toggleContinent(continent: string) {
    const i = selectedContinents.value.indexOf(continent)
    if (i === -1) {
      selectedContinents.value.push(continent)
    } else {
      selectedContinents.value.splice(i, 1)
    }
  }

  function selectDifficulty(level: Difficulty) {
    selectedDifficulty.value = level
  }

  function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5)
  }

  function afficherMessage(texte: string, dureeMs = 2000) {
    message.value = texte
    setTimeout(() => {
      if (message.value === texte) message.value = ''
    }, dureeMs)
  }

  // Retrouve le continent d'appartenance d'un pays donné.
  // Fonctionne par ÉGALITÉ DE RÉFÉRENCE (Array.includes sur des objets),
  // pas par comparaison de valeur — ça marche uniquement parce que
  // currentQuestions.value contient les MÊMES instances d'objets que
  // data.value.continents[x] (flatMap et shuffle() ne clonent jamais les
  // Country, ils ne réorganisent/aplatissent que les tableaux qui les
  // contiennent). Si un jour un clone profond était introduit quelque
  // part dans la chaîne (ex: JSON.parse(JSON.stringify(...))), cette
  // fonction cesserait silencieusement de trouver le bon continent.
  function findContinentOf(country: Country): string | null {
    if (!data.value) return null
    for (const [continent, countries] of Object.entries(data.value.continents)) {
      if (countries.includes(country)) return continent
    }
    return null
  }

  function startQuizFromSelection() {
    if (!data.value) return

    let countries = selectedContinents.value.flatMap(c => data.value!.continents[c] || [])

    const allowed = DIFFICULTY_LEVELS[selectedDifficulty.value] || ['facile']
    countries = countries.filter(c => allowed.includes(c.difficulte))

    if (countries.length === 0) {
      afficherMessage('Aucun pays disponible pour cette difficulté et ces continents.')
      return
    }

    maxRounds.value = Math.min(20, countries.length * 2)
    currentQuestions.value = shuffle(countries)

    screen.value = 'quiz'
    startQuiz()
  }

  function startQuiz() {
    score.value = 0
    streak.value = 0
    bestStreak.value = 0
    totalAnswers.value = 0
    roundsPlayed.value = 0
    currentStep.value = 'pays'

    pickRandomQuestion()
    renderQuestion()

    startTime = Date.now()
    elapsedSeconds.value = 0
    clearTimer()
    timerInterval = setInterval(() => {
      elapsedSeconds.value = Math.floor((Date.now() - startTime) / 1000)
    }, 1000)
  }

  // Chaque pays génère 2 manches consécutives (pays puis capitale) — d'où
  // la division par 2 : countryIndex avance d'une unité tous les 2 rounds.
  function pickRandomQuestion() {
    const countryIndex = Math.floor(roundsPlayed.value / 2)
    currentQuestion.value = currentQuestions.value[countryIndex]
    currentContinent.value = currentQuestion.value ? findContinentOf(currentQuestion.value) : null
  }

  // Pioche les fausses réponses uniquement parmi les pays du même continent
  // que la question courante (voir currentContinent) — empêche des
  // mauvaises réponses hors-sujet (ex: un pays d'Asie proposé alors que
  // la question porte sur l'Europe).
  function generateOptions(correct: string, key: 'pays' | 'capitale') {
    const opts = [correct]

    const pool = currentContinent.value && data.value
      ? data.value.continents[currentContinent.value] || []
      : []

    while (opts.length < 4 && opts.length < pool.length) {
      const rand = pool[Math.floor(Math.random() * pool.length)][key]
      if (!opts.includes(rand)) opts.push(rand)
    }

    return shuffle(opts)
  }

  function renderQuestion() {
    if (!currentQuestion.value) return
    locked.value = false
    selectedOption.value = null
    correctOption.value = null

    const key = currentStep.value === 'pays' ? 'pays' : 'capitale'
    const correct = currentQuestion.value[key]
    options.value = generateOptions(correct, key)
  }

  function handleAnswer(opt: string) {
    if (!currentQuestion.value || locked.value) return

    locked.value = true
    selectedOption.value = opt

    const correctValue = currentStep.value === 'pays' ? currentQuestion.value.pays : currentQuestion.value.capitale
    correctOption.value = correctValue

    const isCorrect = opt === correctValue

    if (isCorrect) {
      score.value++
      streak.value++
      if (streak.value > bestStreak.value) bestStreak.value = streak.value
      flagAnim.value = 'correct'
    } else {
      streak.value = 0
      flagAnim.value = 'wrong'
    }

    totalAnswers.value++

    setTimeout(next, 700)
  }

  function next() {
    flagAnim.value = null
    roundsPlayed.value++

    if (roundsPlayed.value >= maxRounds.value) {
      endQuiz()
      return
    }

    if (currentStep.value === 'pays') {
      currentStep.value = 'capitale'
    } else {
      currentStep.value = 'pays'
      pickRandomQuestion()
    }

    renderQuestion()
  }

  function clearTimer() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  function endQuiz() {
    clearTimer()
    screen.value = 'end'
  }

  // Rejoue avec les MÊMES continents/difficulté déjà choisis (pas de reset
  // de selectedContinents/selectedDifficulty ici, contrairement à
  // backToContinentSelection ci-dessous) — juste un nouveau tirage/mélange
  // sur le même pool de pays.
  function restartQuiz() {
    screen.value = 'quiz'
    startQuizFromSelection()
  }

  function backToContinentSelection() {
    clearTimer()
    score.value = 0
    streak.value = 0
    bestStreak.value = 0
    totalAnswers.value = 0
    roundsPlayed.value = 0
    selectedContinents.value = []
    selectedDifficulty.value = 'facile'
    screen.value = 'continents'
  }

  onMounted(loadData)
  onBeforeUnmount(clearTimer)

  return {
    loading,
    loadError,
    screen,
    continentsList,
    selectedContinents,
    selectedDifficulty,
    currentQuestion,
    currentStep,
    score,
    streak,
    bestStreak,
    totalAnswers,
    roundsPlayed,
    maxRounds,
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
  }
}