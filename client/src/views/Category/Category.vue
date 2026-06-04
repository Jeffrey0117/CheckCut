<template>
  <div class="min-h-screen page-root">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-6">{{ categoryName }}</h1>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 spinner"></div>
      </div>

      <div v-else-if="videos.length === 0" class="text-center py-12 meta-text">
        這個分類目前沒有影片。
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <VideoCard v-for="video in videos" :key="video.id" :video="video" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getVideos } from '../../helpers/api/local.js'
import VideoCard from '../../components/VideoCard/VideoCard.vue'

const route = useRoute()
const videos = ref([])
const loading = ref(true)

const categoryName = computed(() => decodeURIComponent(route.params.name || ''))

async function loadCategory(name) {
  loading.value = true
  try {
    const data = await getVideos({ category: name, limit: 50 })
    videos.value = data.videos || []
  } catch (err) {
    console.error('Failed to load category:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadCategory(route.params.name))

watch(() => route.params.name, (newName) => {
  if (newName) loadCategory(newName)
})
</script>

<style scoped>
.page-root {
  background-color: var(--bg-color);
  color: var(--primary-text-color);
}

.spinner {
  border-color: var(--primary-color);
}

.meta-text {
  color: var(--tertiary-text-color);
}
</style>
