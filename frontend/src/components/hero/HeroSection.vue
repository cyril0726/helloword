<template>
  <section class="hero page hero--compact">
    <div class="hero__content">
      <span class="eyebrow">CraftGuild • WEB LAB</span>

      <h1 class="hero__title">
        <span>Créer.</span>
        <span>Expérimenter.</span>
        <span>Construire.</span>
      </h1>

      <p class="hero__subtitle">
        Un laboratoire d'interfaces, de mini-expériences et de systèmes web interactifs.
      </p>

      <div class="actions">
        <RouterLink to="/lab" class="btn btn--primary">
          Explorer le laboratoire
        </RouterLink>
      </div>
    </div>

    <!-- Mini-preview asymétrique (bento) du Lab : 4 tuiles, chacune avec
         une micro-icône + un point de statut. Sert de teaser honnête vers
         la vraie page /lab plutôt qu'un motif purement décoratif — voir
         /docs/Architecture.md, section "Signature visuelle". Les tuiles
         "live" ont une ligne de titre factice + pulsation douce ; les
         tuiles "wip" restent plus discrètes (icône en --text-muted, pas
         de ligne). Ce contenu est codé en dur ici, pas lié dynamiquement
         à ExplorerGrid.vue — si les jeux du Lab changent, penser à mettre
         ce teaser à jour manuellement (pas de synchronisation automatique). -->
    <div class="hero__visual">
      <div class="hero-plate">
        <div class="mini-lab">
          <div class="mini-tile mini-tile--lg mini-tile--live">
            <span class="mini-dot mini-dot--live"></span>
            <svg class="mini-icon" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5">
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M7 10v4M5 12h4M15 11h.01M18 13h.01" />
            </svg>
            <span class="mini-line"></span>
          </div>

          <div class="mini-tile mini-tile--sm mini-tile--wip">
            <span class="mini-dot mini-dot--wip"></span>
            <svg class="mini-icon" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
              <rect x="4" y="4" width="7" height="7" rx="1" />
              <rect x="13" y="4" width="7" height="7" rx="1" />
              <rect x="4" y="13" width="7" height="7" rx="1" />
              <rect x="13" y="13" width="7" height="7" rx="1" />
            </svg>
          </div>

          <div class="mini-tile mini-tile--sm mini-tile--wip">
            <span class="mini-dot mini-dot--wip"></span>
            <svg class="mini-icon" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
              <circle cx="12" cy="12" r="8" />
              <path d="M12 8v4l3 2" />
            </svg>
          </div>

          <div class="mini-tile mini-tile--md mini-tile--live">
            <span class="mini-dot mini-dot--live"></span>
            <svg class="mini-icon" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5">
              <path d="M4 18l6-6-6-6M12 18h8" />
            </svg>
            <span class="mini-line"></span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: 1fr 420px;
  align-items: center;
  gap: var(--space-6);
}

/* Padding réduit par rapport à .page (hérité, 64px) — évite l'ascenseur
   vertical qu'on avait sur desktop standard avec le padding par défaut. */
.hero--compact {
  padding-block: var(--space-4); /* 24px au lieu de 64px hérité de .page */
}

.eyebrow {
  font-size: 12px;
  color: var(--accent);
  letter-spacing: 0.08em;
  font-weight: 600;
}

.hero__title span {
  display: block;
}

.hero__title {
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin-top: var(--space-2);
  font-size: clamp(1.75rem, 3.5vw, 2.75rem);
}

.hero__subtitle {
  margin-top: var(--space-3);
  color: var(--text-muted);
  max-width: 420px;
}

.actions {
  margin-top: var(--space-5);
}

.hero__visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-plate {
  width: min(260px, 70vw); /* au lieu de 300px, réduit pour libérer de la hauteur */
  aspect-ratio: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--radius-md);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
}

/* Grille asymétrique (bento) : une grande tuile à gauche sur 2 lignes,
   deux petites empilées à droite, une moyenne en bas — évoque une vraie
   hiérarchie d'interface plutôt qu'un damier régulier. */
.mini-lab {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: var(--space-2);
  width: 78%;
  height: 78%;
}

.mini-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg);
  transition: var(--ease);
}

.mini-tile--lg {
  grid-row: 1 / 3;
}

.mini-tile--live {
  border-color: var(--border-hover);
}

.mini-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.mini-dot--live {
  background: var(--status-live);
}

.mini-dot--wip {
  background: var(--status-wip);
  opacity: 0.7;
}

.mini-icon {
  width: 22px;
  height: 22px;
  opacity: 0.85;
}

/* Fausse ligne de "titre" — présente uniquement sur les tuiles live,
   pour suggérer un contenu chargé (vs les tuiles wip, plus discrètes). */
.mini-line {
  width: 60%;
  height: 3px;
  border-radius: 999px;
  background: var(--border-hover);
}

/* Pulsation douce, uniquement sur le point de statut des tuiles live —
   attire l'œil sans animer toute la composition (cohérent avec "smooth",
   pas de mouvement continu généralisé). */
@keyframes pulse-live {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
  50% { box-shadow: 0 0 0 3px var(--status-live-bg); }
}

.mini-tile--live .mini-dot--live {
  animation: pulse-live 2.5s ease-in-out infinite;
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .hero__subtitle {
    margin-left: auto;
    margin-right: auto;
  }
  .hero-plate {
    width: 220px;
  }
}

@media (max-width: 480px) {
  .hero-plate {
    width: 180px;
  }
}
</style>