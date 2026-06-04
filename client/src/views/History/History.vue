<template>
  <div class="min-h-screen page-root">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Watch History</h1>
        <button
          v-if="history.length > 0"
          class="neutral-btn px-4 py-2 text-sm rounded-lg transition-colors"
          @click="clearAll"
        >
          Clear All
        </button>
      </div>

      <div v-if="history.length === 0" class="text-center py-12 meta-text">
        No watch history yet.
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <VideoCard
          v-for="item in history"
          :key="item.videoId"
          :video="{
            id: item.videoId,
            title: item.title,
            thumbnail_url: item.thumbnail_url,
            person_name: item.person_name,
            person_slug: item.person_slug,
            duration: item.duration,
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import VideoCard from '../../components/VideoCard/VideoCard.vue'

const store = useStore()
const history = computed(() => store.getters['history/getHistory'] || [])

function clearAll() {
  store.commit('history/clearHistory')
}
</script>

<style scoped>
.page-root {
  background-color: var(--bg-color);
  color: var(--primary-text-color);
}

.meta-text {
  color: var(--tertiary-text-color);
}

.neutral-btn {
  background-color: var(--card-bg-color);
  color: var(--primary-text-color);
}

.neutral-btn:hover {
  background-color: var(--secondary-card-bg-color);
}
</style>
