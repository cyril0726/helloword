<template>
  <header class="nav">
    <RouterLink to="/" class="nav-brand" exact-active-class="">
      CraftGuild
    </RouterLink>

    <div class="nav-right">
      <nav class="nav-links">
        <RouterLink to="/" class="nav-item">Home</RouterLink>
        <RouterLink to="/lab" class="nav-item">Lab</RouterLink>
        <RouterLink to="/about" class="nav-item">About</RouterLink>
      </nav>

		<div class="nav-actions">
      <AccountTeaser />
		  <ThemeSwitcher />
		</div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import AccountTeaser from '@/components/AccountTeaser.vue'
</script>

<style scoped>
.nav {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4);
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.nav-brand {
  text-decoration: none;
  color: var(--accent);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* regroupement logique */
.nav-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.nav-links {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.nav-item {
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color var(--ease);
}

.nav-item:hover {
  color: var(--text);
}

.router-link-active {
  color: var(--accent);
}

/* future zone */
.nav-actions {
  display: flex;
  align-items: center;
}
</style>