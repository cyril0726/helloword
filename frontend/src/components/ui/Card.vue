<template>
  <RouterLink :to="item.link" class="card">

    <span class="icon">{{ item.icon }}</span>

    <div class="content">
      <div class="top">
        <h3>{{ item.title }}</h3>
        <span v-if="item.tag" class="tag">{{ item.tag }}</span>
      </div>

      <p>{{ item.desc }}</p>
    </div>

  </RouterLink>
</template>

<script setup lang="ts">
defineProps<{ item: any }>()
</script>

<style>
</style>