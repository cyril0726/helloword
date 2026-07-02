<template>
  <section class="hero page">

    <!-- LEFT -->
    <div class="hero__content">

      <span class="eyebrow">GRIDCRAFT • WEB LAB</span>

      <h1 class="hero__title">
        <span>Créer.</span>
        <span>Expérimenter.</span>
        <span>Construire.</span>
      </h1>

      <p class="hero__subtitle">
        Un laboratoire d’interfaces, de mini-expériences et de systèmes web interactifs.
      </p>

      <div class="actions">
        <RouterLink to="/lab" class="btn btn--primary">
          Explorer le laboratoire
        </RouterLink>
      </div>

    </div>

    <!-- RIGHT -->
    <div class="hero__visual">

      <div class="hero-orb">

<svg viewBox="0 0 200 200" class="hero-svg">
  <defs>
    <linearGradient id="g">
      <stop offset="0%" stop-color="#aa3bff" />
      <stop offset="100%" stop-color="#6b9bff" />
    </linearGradient>
  </defs>

  <!-- grid -->
  <g opacity="0.35">
    <path d="M40 20 V180" stroke="#aaa" />
    <path d="M80 20 V180" stroke="#aaa" />
    <path d="M120 20 V180" stroke="#aaa" />
    <path d="M160 20 V180" stroke="#aaa" />

    <path d="M20 40 H180" stroke="#aaa" />
    <path d="M20 80 H180" stroke="#aaa" />
    <path d="M20 120 H180" stroke="#aaa" />
    <path d="M20 160 H180" stroke="#aaa" />
  </g>

  <!-- core -->
  <rect x="70" y="70" width="60" height="60" rx="12"
        fill="url(#g)" opacity="0.9" />

  <!-- orbit nodes -->
  <circle cx="100" cy="20" r="5" fill="#aa3bff" />
  <circle cx="180" cy="100" r="5" fill="#6b9bff" />
  <circle cx="100" cy="180" r="5" fill="#aa3bff" />
  <circle cx="20" cy="100" r="5" fill="#6b9bff" />
</svg>

      </div>

    </div>

  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style>
/* =========================
   LAYOUT
========================= */

.hero {
  display: grid;
  grid-template-columns: 1fr 420px;
  align-items: center;
  gap: 60px;
  min-height: 75vh;
}

/* =========================
   TEXT
========================= */

.hero__title span {
  display: block;
}

.hero__title {
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.hero__subtitle {
  margin-top: 14px;
  opacity: 0.75;
  max-width: 420px;
}

/* =========================
   VISUAL WRAPPER
========================= */

.hero__visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-orb {
  width: min(300px, 80vw);
  aspect-ratio: 1;
  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 28px;
  background: rgba(20, 20, 30, 0.55);
  backdrop-filter: blur(14px);

  border: 1px solid rgba(255, 255, 255, 0.08);

  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.45);

  animation: float 6s ease-in-out infinite;
}

/* =========================
   SVG
========================= */

.hero-svg {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
  filter: drop-shadow(0 0 8px rgba(170, 59, 255, 0.15));
}

/* =========================
   ANIMATIONS
========================= */

@keyframes float {
  0% { transform: translateY(0px) rotate(-2deg); }
  50% { transform: translateY(-12px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(-2deg); }
}

/* =========================
   RESPONSIVE
========================= */

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero__subtitle {
    margin-left: auto;
    margin-right: auto;
  }
  .hero-orb {
    width: 220px;
  }
}

@media (max-width: 480px) {
  .hero-orb {
    width: 180px;
  }
}
</style>