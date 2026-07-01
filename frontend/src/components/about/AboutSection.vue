<template>
  <section class="about">

    <!-- LEFT -->
    <div class="about__left">
      <div class="avatar">🧑‍🚀</div>
    </div>

    <!-- RIGHT -->
    <div class="about__content">

      <h2>À propos de HelloWord</h2>

      <p>
        HelloWord est un laboratoire personnel de création numérique :
        jeux, interfaces et expériences interactives.
      </p>

      <p>
        Objectif : tester, apprendre et construire des projets concrets
        autour du web interactif et du game design.
      </p>

      <div class="stats">
        <div class="stat">
          <strong>10+</strong>
          <span>Projets</span>
        </div>

        <div class="stat">
          <strong>4+</strong>
          <span>Jeux</span>
        </div>

        <div class="stat">
          <strong>∞</strong>
          <span>Expériences</span>
        </div>
      </div>

    </div>

  </section>
</template>

<style>
.about {
  display: flex;
  gap: 40px;
  padding: 48px 24px;
  max-width: 900px;
  margin: 0 auto;
}

.about__left {
  min-width: 160px;
}

.avatar {
  font-size: 40px;
  margin-bottom: 12px;
}

.badge {
  font-size: 11px;
  color: #777;
}

.about__content h2 {
  font-size: 20px;
  margin-bottom: 12px;
}

.about__content p {
  font-size: 14px;
  color: #777;
  line-height: 1.6;
  margin-bottom: 12px;
}

.support a {
  color: #aaa;
  text-decoration: underline;
}

.stats {
  display: flex;
  gap: 24px;
  margin-top: 20px;
}

.stat strong {
  display: block;
  font-size: 16px;
}

.stat span {
  font-size: 11px;
  color: #777;
}
</style>