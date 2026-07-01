<template>
  <div class="card">

    <span v-if="item && item.tag" class="badge">
      {{ item.tag }}
    </span>

    <span class="icon">{{ item?.icon }}</span>

    <div class="content">
      <h3>{{ item?.title }}</h3>
      <p>{{ item?.desc }}</p>
    </div>

  </div>
</template>

<script setup>
defineProps({
  item: Object
})
</script>

<style>
.card {
  position: relative;
  padding: 16px;

  border: 1px solid #222;
  background: #0f0f0f;

  color: white;
}

.icon {
  font-size: 20px;
}

h3 {
  margin: 8px 0 4px;
}

p {
  font-size: 12px;
  color: #777;
}

.badge {
  position: absolute;
  top: 10px;
  right: 10px;

  font-size: 10px;
  padding: 4px 8px;

  border-radius: 999px;

  background: #111827;
  border: 1px solid #333;

  color: #fbbf24;
}
</style>