<template>
<section class="about page">

  <div class="card about-card">

    <div class="about-header">
      <div class="avatar">🧑‍🚀</div>

      <div>
        <h2>HelloWord Lab</h2>
        <span class="tag">Web • Games • Experiments</span>
      </div>
    </div>

    <p>
      HelloWord est un laboratoire personnel de création numérique dédié aux interfaces interactives et aux expériences web.
    </p>

    <p>
      Objectif : construire, tester et itérer sur des idées de jeux, d’outils et de micro-expériences.
    </p>

    <div class="stats">
      <div><strong>10+</strong><span>Projets</span></div>
      <div><strong>4+</strong><span>Jeux</span></div>
      <div><strong>∞</strong><span>Expériences</span></div>
    </div>
  </div>

</section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style>
.about-card {
  max-width: 800px;
  margin: 0 auto;
}

.about-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.avatar {
  font-size: 42px;
}

.tag {
  font-size: 11px;
  color: #666;
}

.about-card p {
  color: #777;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 10px;
}

.stats {
  display: flex;
  gap: 24px;
  margin-top: 20px;
}

.stats strong {
  display: block;
  color: white;
}

.stats span {
  font-size: 11px;
  color: #777;
}
</style>