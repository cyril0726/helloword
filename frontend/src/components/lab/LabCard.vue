<template>
  <component
    :is="isLive ? RouterLink : 'div'"
    :to="isLive ? item.link : undefined"
    class="card lab-card"
    :class="{ 'is-hoverable': isLive, 'lab-card--disabled': !isLive }"
  >
    <span
      v-if="item?.tag"
      class="badge"
      :class="tagClass"
    >
      {{ tagLabel }}
    </span>

    <span class="lab-card__icon">{{ item?.icon }}</span>

    <div class="lab-card__content">
      <h3 class="lab-card__title">{{ item?.title }}</h3>
      <p class="lab-card__desc">{{ item?.desc }}</p>
    </div>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  item: Object
})

const isLive = computed(() => props.item?.tag === 'live')

const tagClass = computed(() => {
  return props.item?.tag === 'live' ? 'badge--live' : 'badge--wip'
})

const tagLabel = computed(() => {
  return props.item?.tag === 'live' ? 'live' : 'en travaux'
})
</script>

<style scoped>
.lab-card {
  display: block;
  text-decoration: none;
  color: inherit;
}

.lab-card--disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.lab-card__icon {
  font-size: 20px;
  display: block;
}

.lab-card__title {
  margin: var(--space-2) 0 4px;
  font-size: 15px;
  color: var(--text);
}

.lab-card__desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}

.badge {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid;
}

.badge--wip {
  background: var(--status-wip-bg);
  border-color: var(--status-wip);
  color: var(--status-wip);
}

.badge--live {
  background: var(--status-live-bg);
  border-color: var(--status-live);
  color: var(--status-live);
}

.lab-card.is-hoverable:hover {
  border-color: var(--accent);
}

.lab-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>