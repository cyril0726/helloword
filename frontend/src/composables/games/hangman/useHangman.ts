import { ref, computed } from 'vue'

const MOTS = [
  "MAISON","VOITURE","ORDINATEUR","TELEPHONE","CHAT","CHIEN","OISEAU","ARBRE","FLEUR","SOLEIL",
  "LUNETTES","LIVRE","STYLO","CAHIER","TABLE","CHAISE","FENETRE","PORTE","JARDIN","PARC",
  "VILLE","MONTAGNE","RIVIERE","OCEAN","AVION","TRAIN","VELO","BATEAU","CAMION","MOTO",

  "BANANE","POMME","FRAISE","CERISE","ANANAS","ORANGE","RAISIN","PASTEQUE","KIWI","MANGUE",
  "TOMATE","CAROTTE","POMMEDETERRE","SALADE","OIGNON","POIVRON","CONCOMBRE","HARICOT","COURGETTE","AUBERGINE",

  "FROMAGE","PAIN","BEURRE","CHOCOLAT","GATEAU","BISCUIT","BONBON","PIZZA","HAMBURGER","SANDWICH",
  "OMELETTE","LASAGNE","SPAGHETTI","CROISSANT","BAGUETTE","YAOURT","GLACE","SUCRE","MIEL","CONFITURE",

  "ECOLE","COLLEGE","LYCEE","UNIVERSITE","PROFESSEUR","ETUDIANT","EXAMEN","EXERCICE","MATHEMATIQUES","HISTOIRE",
  "GEOGRAPHIE","SCIENCE","PHYSIQUE","CHIMIE","BIOLOGIE","MUSIQUE","DESSIN","LECTURE","ECRITURE","VOCABULAIRE",

  "PLAGE","FORET","DESERT","VOLCAN","CASCADE","LAC","ILE","PRAIRIE","NUAGE","ORAGE",
  "TONNERRE","ECLAIR","TEMPETE","BROUILLARD","NEIGE","PLUIE","VENT","ARCENCIEL","ETOILE","PLANETE",

  "CUISINE","SALON","CHAMBRE","GARAGE","BALCON","ESCALIER","PLAFOND","PLANCHER","OREILLER","COUVERTURE",
  "DOUCHE","BAIGNOIRE","SERVIETTE","LAMPE","CANAPE","FAUTEUIL","MIROIR","BUREAU","ETAGERE","ARMOIRE",

  "POLICIER","POMPIER","MEDECIN","INFIRMIER","BOULANGER","CUISINIER","JARDINIER","MECANICIEN","ARCHITECTE","AVOCAT",
  "JOURNALISTE","SCULPTEUR","PEINTRE","CHANTEUR","DANSEUR","ACTEUR","PROGRAMMEUR","INGENIEUR","PILOTE","FACTEUR",

  "FOOTBALL","BASKETBALL","HANDBALL","VOLLEYBALL","TENNIS","NATATION","ATHLETISME","CYCLISME","ESCALADE","RANDONNEE",
  "PATINAGE","SKATEBOARD","SURF","PLONGEE","BOXE","JUDO","KARATE","ESCRIME","SKI","SNOWBOARD",

  "DRAGON","CHEVALIER","PRINCESSE","MAGICIEN","SORCIERE","MONSTRE","FANTOME","VAMPIRE","LOUPGAROU","TRESOR",
  "CHATEAU","ROYAUME","AVENTURE","MYSTERE","LABYRINTHE","SECRET","LEGENDE","ENIGME","PORTAIL","CRISTAL",

  "INTERNET","CLAVIER","SOURIS","ECRAN","SERVEUR","RESEAU","APPLICATION","NAVIGATEUR","ALGORITHME","BASEDEDONNEES",
  "PROGRAMMATION","JAVASCRIPT","PYTHON","VARIABLE","FONCTION","BOUCLE","CONDITION","COMPILATEUR","SECURITE","NUMERIQUE"
]

const MAX_ERREURS = 6

// ⚠️ Contrairement à useTables/useFlags/useQuickdraw (qui nettoient leurs
// timers via onBeforeUnmount), aucun des setTimeout ci-dessous (shake,
// message, redémarrage auto après victoire/défaite) n'est annulé si le
// composant est démonté avant leur exécution. Impact limité en pratique
// (aucun crash, juste initialiserJeu() qui pourrait s'exécuter inutilement
// sur un état que plus personne ne lit si le joueur quitte la page dans
// la fenêtre de 1,2-1,5s après une victoire/défaite) — mais incohérent
// avec la discipline appliquée ailleurs. Non corrigé pour l'instant.
export function useHangman() {
  const motATrouver = ref('')
  const lettresUtilisees = ref<string[]>([])
  const lettresCorrectes = ref<string[]>([])
  const erreurs = ref(0)
  const jeuTermine = ref(false)
  const message = ref('')
  const shake = ref(false)

  // Mot affiché : lettres trouvées, "_" sinon (espacées, comme l'original)
  const motAffiche = computed(() => {
    if (jeuTermine.value && erreurs.value >= MAX_ERREURS) {
      return motATrouver.value.split('').join(' ')
    }
    return [...motATrouver.value]
      .map(lettre => (lettresCorrectes.value.includes(lettre) ? lettre : '_'))
      .join(' ')
  })

  const aGagne = computed(() => {
    return [...motATrouver.value].every(lettre => lettresCorrectes.value.includes(lettre))
  })

  const aPerdu = computed(() => erreurs.value >= MAX_ERREURS)

  // N'exclut pas le mot précédent — un même mot peut retomber deux fois
  // de suite après une victoire/défaite (comportement identique à
  // l'original avant portage, non changé volontairement).
  function choisirMot() {
    return MOTS[Math.floor(Math.random() * MOTS.length)]
  }

  function initialiserJeu() {
    motATrouver.value = choisirMot()
    lettresUtilisees.value = []
    lettresCorrectes.value = []
    erreurs.value = 0
    jeuTermine.value = false
    message.value = ''
  }

  function declencherShake() {
    shake.value = true
    setTimeout(() => {
      shake.value = false
    }, 300)
  }

  function afficherMessage(texte: string, dureeMs = 2000) {
    message.value = texte
    setTimeout(() => {
      if (message.value === texte) message.value = ''
    }, dureeMs)
  }

  function verifierLettre(lettreBrute: string) {
    if (jeuTermine.value) return

    const lettre = lettreBrute.toUpperCase().trim()

    if (!/^[A-Z]$/.test(lettre)) {
      afficherMessage('Lettre invalide')
      return
    }
    if (lettresUtilisees.value.includes(lettre)) {
      afficherMessage('Lettre déjà utilisée')
      return
    }

    lettresUtilisees.value.push(lettre)

    if (motATrouver.value.includes(lettre)) {
      lettresCorrectes.value.push(lettre)
    } else {
      erreurs.value++
      declencherShake()
    }

    if (aGagne.value) {
      jeuTermine.value = true
      afficherMessage('Victoire !', 1200)
      setTimeout(initialiserJeu, 1200)
      return
    }

    if (aPerdu.value) {
      jeuTermine.value = true
      afficherMessage(`Perdu : ${motATrouver.value}`, 1500)
      setTimeout(initialiserJeu, 1500)
    }
  }

  return {
    // state (lecture seule côté composant)
    motAffiche,
    lettresUtilisees,
    erreurs,
    maxErreurs: MAX_ERREURS,
    jeuTermine,
    message,
    shake,
    // actions
    initialiserJeu,
    verifierLettre
  }
}