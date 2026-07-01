<template>
  <section class="hero page">

    <!-- Partie gauche -->
    <div class="hero__content">

      <span class="eyebrow">LAB • EXPÉRIMENTAL</span>

      <h1>
        <span>Créer.</span>
        <span>Expérimenter.</span>
        <span>Partager.</span>
      </h1>

      <p>
        Jeux, interfaces et expériences interactives.
      </p>

      <div class="actions">
        <RouterLink to="/lab" class="btn btn--primary">
          Explorer le laboratoire
        </RouterLink>
      </div>

    </div>

    <!-- Partie droite -->
    <div class="hero__visual">

      <div class="hero-object">
        <span class="hero-object__label">&lt;/&gt;</span>
      </div>

    </div>

  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style>
h1 span {
  display: block;
}

.hero__content h1 {
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.hero {
  display: grid;
  grid-template-columns: 1fr 420px;
  align-items: center;
  gap: 48px;

  min-height: 70vh;
}

.hero__content {
  text-align: left;
}

.hero__visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-object__label {
  position: relative;
  z-index: 2;
  font-size: 64px;
  font-weight: 600;
  color: #6b6b7a;
}

.hero-object::before {
  content: "";
  position: absolute;
  inset: 20px;

  border-radius: 50%;

  background: radial-gradient(
    circle,
    rgba(170, 59, 255, 0.4),
    transparent 70%
  );

  filter: blur(20px);
  animation: pulse 4s ease-in-out infinite;
}

.hero-object {
  width: 280px;
  aspect-ratio: 1;

  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;
  overflow: hidden;

  border-radius: 28px;

  background: rgba(20, 20, 30, 0.6);
  backdrop-filter: blur(12px);

  border: 1px solid rgba(255, 255, 255, 0.08);

  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4);

  animation: float 6s ease-in-out infinite;
}

.hero-object::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;

  width: 200%;
  height: 200%;

  background: radial-gradient(
    circle,
    rgba(170, 59, 255, 0.25),
    transparent 60%
  );

  animation: rotateLight 10s linear infinite;
}



@keyframes float {

  0% {
    transform: translateY(0px) rotate(-2deg);
  }

  50% {
    transform: translateY(-10px) rotate(2deg);
  }

  100% {
    transform: translateY(0px) rotate(-2deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(0.9);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes rotateLight {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}


</style>