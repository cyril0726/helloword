<template>
  <section class="about page">
    <div class="card about-card">
      <div class="about-header">
        <!-- Sceau "CG" : identité visuelle de la marque, distincte du rôle
             du hero (qui évoque le contenu du Lab, pas la marque elle-même
             — voir /docs/Architecture.md, section "Signature visuelle").
             Ce SVG est inline ici uniquement — jamais extrait en composant
             réutilisable (ex: LogoSeal.vue), alors qu'on l'avait envisagé
             à un moment. Candidat à factoriser si on veut le réutiliser
             ailleurs (navbar, favicon...) sans dupliquer le SVG. -->
        <div class="avatar">
          <svg viewBox="0 0 100 100" class="seal">
            <polygon
              points="50,4 90,27 90,73 50,96 10,73 10,27"
              fill="none" stroke="var(--accent)" stroke-width="1.5"
            />
            <polygon
              points="50,16 79,32.5 79,67.5 50,84 21,67.5 21,32.5"
              fill="none" stroke="var(--border-hover)" stroke-width="0.75"
            />
            <text
              x="50" y="60" text-anchor="middle"
              font-family="var(--font-base)" font-size="28"
              font-weight="700" letter-spacing="-1"
              fill="var(--accent)"
            >CG</text>
          </svg>
        </div>

        <div>
          <h2 class="about-title">CraftGuild Lab</h2>
          <span class="tag">Web • Games • Experiments</span>
        </div>
      </div>

      <p>
        CraftGuild est un laboratoire personnel de création numérique dédié aux interfaces interactives et aux expériences web.
      </p>

      <p>
        Objectif : construire, tester et itérer sur des idées de jeux, d'outils et de micro-expériences.
      </p>

      <!-- ⚠️ Chiffres codés en dur, jamais recalculés automatiquement.
           "4+ Jeux" est déjà obsolète (5 jeux en ligne actuellement :
           Hangman, Tables, Flags, TicTacToe, QuickDraw). "10+" et "∞"
           sont volontairement approximatifs/décoratifs (pas censés
           représenter un vrai compte), mais le nombre de jeux, lui,
           mériterait d'être tenu à jour à chaque ajout — ou calculé
           dynamiquement depuis la liste des jeux du Lab plutôt que
           recopié manuellement ici (voir ExplorerGrid.vue). -->
      <div class="stats">
        <div><strong>10+</strong><span>Projets</span></div>
        <div><strong>4+</strong><span>Jeux</span></div>
        <div><strong>∞</strong><span>Expériences</span></div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Aucune logique : page entièrement statique (texte + SVG inline).
</script>

<style scoped>
.about-card {
  max-width: 800px;
  margin: 0 auto;
}

.about-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.avatar {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--bg);
  border: 1px solid var(--border);
}

.seal {
  width: 44px;
  height: 44px;
}

.about-title {
  color: var(--text);
  font-size: 18px;
  margin: 0 0 2px;
}

.tag {
  font-size: 11px;
  color: var(--text-muted);
}

.about-card p {
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: var(--space-2);
}

/* Bloc stats : séparé visuellement du texte par une bordure supérieure,
   cohérent avec le style "carte posée" du reste de la DA (pas de glow,
   juste une séparation nette). */
.stats {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}

.stats strong {
  display: block;
  color: var(--text);
  font-size: 18px;
}

.stats span {
  font-size: 11px;
  color: var(--text-muted);
}
</style>