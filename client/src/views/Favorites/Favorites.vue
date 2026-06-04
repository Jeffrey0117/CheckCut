<template>
  <div class="min-h-screen page-root">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-6">Favorites</h1>

      <div v-if="favorites.length === 0" class="text-center py-12 meta-text">
        No favorites yet. Start watching and add videos to your favorites.
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <VideoCard
          v-for="fav in favorites"
          :key="fav.videoId"
          :video="{
            id: fav.videoId,
            title: fav.title,
            thumbnail_url: fav.thumbnail_url,
            person_name: fav.person_name,
            person_slug: fav.person_slug,
            duration: fav.duration,
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
const favorites = computed(() => store.getters['favorites/getFavorites'] || [])
</script>

<style scoped>
.page-root {
  background-color: var(--bg-color);
  color: var(--primary-text-color);
}

.meta-text {
  color: var(--tertiary-text-color);
}
</style>
