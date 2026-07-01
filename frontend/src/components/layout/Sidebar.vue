<template>
  <aside class="sidebar">

    <div class="sidebar__brand">
      <span>⚙️ HelloWord</span>
    </div>

    <nav class="sidebar__nav">

      <RouterLink to="/" class="link">
        Home
      </RouterLink>

      <RouterLink to="/dashboard" class="link">
        Dashboard
      </RouterLink>

      <RouterLink to="/projects" class="link">
        Projects
      </RouterLink>

      <RouterLink to="/lab" class="link">
        Lab
      </RouterLink>

    </nav>

    <div class="sidebar__footer">
      <span class="status">● Online</span>
    </div>

  </aside>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
}

.sidebar__brand {
  font-weight: bold;
  margin-bottom: 24px;
  font-size: 16px;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.link {
  color: #aaa;
  text-decoration: none;
  padding: 8px 10px;
  border-radius: 6px;
  transition: 0.2s;
}

.link:hover {
  background: #1a1a1a;
  color: white;
}

.router-link-active {
  background: #2a2a2a;
  color: white;
}

.sidebar__footer {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 20px;
}

.status {
  color: #4ade80;
}
</style>