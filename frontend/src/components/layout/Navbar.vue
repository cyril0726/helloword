<template>
  <header class="nav">

    <!-- BRAND -->
    <RouterLink to="/" class="nav-brand">
      GridCraft
    </RouterLink>

    <!-- RIGHT SIDE (nav + actions regroupés) -->
    <div class="nav-right">

      <nav class="nav-links">
        <RouterLink to="/" class="nav-item">Home</RouterLink>
        <RouterLink to="/lab" class="nav-item">Lab</RouterLink>
        <RouterLink to="/about" class="nav-item">About</RouterLink>
      </nav>

      <div class="nav-actions">
        <!-- futur dashboard / profil -->
      </div>

    </div>

  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.nav {
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 24px;

  border-bottom: 1px solid #222;
  background: #0f0f0f;
}

.nav-brand {
  text-decoration: none;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* regroupement logique */
.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-item {
  font-size: 13px;
  color: #777;
  text-decoration: none;
  transition: color 0.15s ease;
}

.nav-item:hover {
  color: #fff;
}

.router-link-active {
  color: #fff;
}

/* future zone */
.nav-actions {
  display: flex;
  align-items: center;
}
</style>