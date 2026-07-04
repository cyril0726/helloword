<template>
  <section class="game-layout">
    <header class="game-topbar">
      <RouterLink to="/" class="game-brand">CraftGuild</RouterLink>
      <span class="game-topbar__sep">/</span>
      <h1 class="game-topbar__title">{{ route.meta.title }}</h1>
      <RouterLink to="/lab" class="back-link">
        <svg viewBox="0 0 24 24" class="back-icon" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Lab
      </RouterLink>
    </header>

    <div class="game-content">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
</script>

<style scoped>
.game-layout {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  width: 100%;
}

.game-topbar {
  height: 48px;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border);
}

.game-brand {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
  text-decoration: none;
  letter-spacing: 0.02em;
}

.game-topbar__sep {
  color: var(--text-faint);
  font-size: 13px;
}

.game-topbar__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
  flex: 1;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color var(--ease);
}

.back-link:hover {
  color: var(--text);
}

.back-icon {
  width: 14px;
  height: 14px;
}

.game-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-5) var(--space-4);
}
</style>