<template>
  <section class="hero">

    <span class="eyebrow">LAB • EXPÉRIMENTAL</span>

    <h1>
      Créer.<br />
      Expérimenter.<br />
      Partager.
    </h1>

    <p>
      Jeux, interfaces et expériences interactives.
    </p>

    <div class="actions">
      <RouterLink to="/lab" class="primary">
        Explorer le laboratoire
      </RouterLink>
    </div>

  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style>
.hero {
  padding: 64px 24px;
}

.badge {
  font-size: 11px;
  color: #888;
  display: inline-block;
  margin-bottom: 12px;
}

h1 {
  font-size: 42px;
  line-height: 1.1;
  margin: 0 0 12px;
}

p {
  color: #777;
  font-size: 15px;
  margin-bottom: 24px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.primary {
  padding: 10px 14px;
  background: #111827;
  border: 1px solid #333;
  color: white;
  text-decoration: none;

  border-radius: 8px;
  transition: 0.15s;
}

.primary:hover {
  transform: translateY(-1px);
  border-color: #444;
}
</style>